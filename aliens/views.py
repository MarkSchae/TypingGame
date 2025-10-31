import json
import math
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django import forms
from django.contrib import messages
from django.http import JsonResponse
from django.shortcuts import render
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.views.decorators.csrf import csrf_exempt
from django.core.files.uploadhandler import TemporaryFileUploadHandler
from django.http.multipartparser import MultiPartParser

from .models import User, Post, Stats, Leaderboard, Mail, HelpWantedTable

class PostForm(forms.Form):
    post_content = forms.CharField(label="Post Content", widget=forms.Textarea(attrs={'id': 'post_content-text','rows': 4, 'cols': 50}))

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "aliens/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "aliens/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        gamertag = request.POST["gamertag"]
        name = request.POST["real-name"]
        country = request.POST["country"]
        email = request.POST["email"]
        profile_pic = request.FILES.get("image")

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "aliens/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.gamertag = gamertag
            user.name = name
            user.country = country
            user.profile_pic = profile_pic # Need to add this to the user model
            user.save()
        except IntegrityError:
            return render(request, "aliens/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "aliens/register.html")
    
def delete_account(request):
    # Code to delete account and everything that was created by that account
    if request.method == 'DELETE':
        user = request.user
        if user.is_authenticated:
            user.delete()  # Delete the user
            logout(request)  # Log the user out after deletion
            return JsonResponse({"message": "Your account has been deleted successfully!"})
        else:
            return JsonResponse({"message": "You are not logged in!"}, status=403)
    else:
        return JsonResponse({"message": "Invalid request method"}, status=400)

# Create your views here.
def index(request):
    return render(request, "aliens/index.html")

# Websockets test chat room raw functionality
def room(request, room_name):
    return render(request, "aliens/room.html", {
        "room_name": room_name
    })

# Play the game
def game(request):
    return render(request, "aliens/game.html")

# Help wanted table with links to a players profile
def help_wanted(request):
    user = request.user
    # If post from js file. Convert json into python dict. Save the variables into python variables. Save the varialbes into model fields
    if request.method == 'POST':
        # Should add if the user is authenticated too
        # Need to add a check for the gamertag and username as the html readonly can be removed and the wrong username/gamertag can be sent
        data =json.loads(request.body)
        gamertag = data.get('tableGamertag')
        game = data.get('helpGame')
        game_day = data.get('helpGameDay')
        
        if user.gamertag != gamertag:
            return JsonResponse({"error": "Do not change your gamertag when submitting!, your account will now be deleted"}, status=400)
        
        # Now create the fields in one of the models or a new model. Create new fields and send the serialized data back to the front
        # Be sure to check if the help wanted post already exsists so the user does not have multiple of the same request, filter for the user and the game
        try:
            help_wanted_entry = HelpWantedTable.objects.get(user=user, game=game)
            return JsonResponse({"error": "This entry already exsists"}, status=400) # Add a redirect here or in the js when this error occurs
        except HelpWantedTable.DoesNotExist:
            help_wanted_entry = HelpWantedTable(user=user, gamertag=gamertag, game=game, game_day=game_day)
            help_wanted_entry.save()
        
        # Now we must return a successful json response with the serialized table so that we can make changes in the js on the front-end 
        help_wanted_entries = HelpWantedTable.objects.all()
        serialized_help_wanted_entries = [entry.help_wanted_table_serialize() for entry in help_wanted_entries]
        
        return JsonResponse(serialized_help_wanted_entries, safe=False)
        
        
    user_info = request.user
    help_wanted_entries = HelpWantedTable.objects.all()
    return render(request, "aliens/helpwanted.html", {
        'user_info': user_info,
        'help_table': help_wanted_entries,
    })

# View the leaderboard
def leaderboard(request):
    # Handle the post on the leaderboard page being submitted
    if request.method == 'POST':
        if request.user.is_authenticated:
            data = json.loads(request.body)
            # Access the submitted form data using cleaned_data dictionary
            post_content = data.get('postContent')
            # Create a new Post object
            new_post = Post(user=request.user, content=post_content)
            new_post.save()
            
            # Get all posts and leaderboard entries in order to serialize and fetch from the js
            posts = Post.objects.order_by('-created_at').all()
            leaderboard_entries = Leaderboard.objects.order_by('-user_skill_rating').all()
            
            # Serialize posts and leaderboard entries into JSON-compatible lists
            # Might need to only send the new post as apposed to all of them if I am laoding all the posts when the html page is clicked
            serialized_posts = [post.post_serialize() for post in posts]
            serialized_leaderboard = [entry.leaderboard_serialize() for entry in leaderboard_entries]
            
            # Create a dictionary to combine both datasets
            data = {
                'posts': serialized_posts,
                'leaderboard_entries': serialized_leaderboard
            }

            # Return JsonResponse with combined data
            return JsonResponse(data, safe=False)
    if request.method == 'GET':
        leaderboard_entries = Leaderboard.objects.order_by('-user_skill_rating').all()
        ranking()
            
        # Serialize posts and leaderboard entries into JSON-compatible lists
        # Might need to only send the new post as apposed to all of them if I am laoding all the posts when the html page is clicked
        # Leaderboard.objects.all() returns a query set that can be manipulated like in SQL, in order to send it as json I need to serialize
        # into a json dict or js object (serialize each entry/object inside the model)
        
        serialized_leaderboard = [entry.leaderboard_serialize() for entry in leaderboard_entries]
        
        # Check if the request is an AJAX request
        if request.headers.get('X-Fetch-Leaderboard') == 'FetchLeaderboard':
            return JsonResponse(serialized_leaderboard, safe=False)
              
    # Some sort of calculation to work out the leaderboard
    # Every user must get a score based on all their stats inserted into a formulae and the leaderboard will be sorted based on which user has the highest score to the lowest etc
    # Done this in the stats view user_skill_rating = calculate_skill_score(total_kills, total_deaths, total_bullets_fired, games_played)
    # PUT request to get the variables we need as well as to update the leaderboard based on each players new stats
    # PUT request need to also update the skill rating for each player
    
    # Sort leaderboard and display
    sorted_leaderboard = Leaderboard.objects.order_by('-user_skill_rating').all()
    ranking()
    posts = Post.objects.order_by('-created_at').all()
    return render(request, "aliens/leaderboard.html", {
        "sorted_leaderboard": sorted_leaderboard,
        "form": PostForm(),
        "posts": posts
    })

# View your(user) and other users profile. Must be able to view others profile too
# Maybe a SPA so once registered the user is prompted to set up the profile with their name and irl details for whatever reason (friends)
# Going to start with boiler plate profile view and leave space to edit and add the extras
# Try to allow players viewing a profile to watch that player play the game and comment in real time
def player_profile(request, user_id):
    if request.method == 'PUT':
        request.upload_handlers = [TemporaryFileUploadHandler()]  # Ensure file upload is handled
        parser = MultiPartParser(request.META, request, request.upload_handlers)
        try:
            data, files = parser.parse()
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Error parsing files: {str(e)}'})

        if 'profile_picture' in files:
            profile_picture = files['profile_picture']
            user = User.objects.get(id=user_id)
            user.profile_pic = profile_picture
            user.save()
            return JsonResponse({'success': True, 'message': 'Profile picture updated successfully'})
        else:
            return JsonResponse({'success': False, 'message': 'No image provided'})
    # Username:
    current_logged_on_user = request.user
    # Retrieve the user based on the username provided via the js file
    onclick_user_profile = User.objects.get(id=user_id)
    mails = Mail.objects.all()
    
    return render(request, "aliens/profile.html", { # This is called the context
        # Username that is used for security along with the password (Use mail for recovery)
        # Gamertag which is what others see, must also be unique
        # Name, which is the persons actual name and does not need to be unique as it wont be used for security
        # Profile pic
        # Country
        # Number of friends (Names of friends)
        # Rivals
        # Achievements 
        # Comments on profile
        "onclick_user_profile" : onclick_user_profile,
        "current_logged_on_user": current_logged_on_user,
        "mails": mails,   
    })

# Function to calculate a helo type of ranking system for the leaderboard
def calculate_skill_score(total_kills, total_deaths, total_bullets_fired, total_games):
    kdr = total_kills / (total_deaths + 1)
    accuracy = total_kills / (total_bullets_fired + 1)
    experience_factor = math.log(total_games + 1)
    
    skill_score = kdr * accuracy * experience_factor
    return skill_score

# Function for updating a user rank based on new game scores
def ranking():
    sorted_leaderboard = Leaderboard.objects.order_by('-user_skill_rating').all()
    rank = 1
    # For user in leaderboard update thier rank and save
    for entry in sorted_leaderboard:
        entry.rank = rank
        entry.save()
        rank += 1
    return True
# Display stats in differnet ways using charts etc from a third part api like py.chart or whatever
# View your/other users stats page have to add a href for clicking on others stats
def players_stats(request, user_id):
    # Might write some functionality to temp store stats for users with no account and if they register then save the data
    # if !user.authenticated show messge temp store redirect to register, if they do register save the data else just redirect
    # Create a instance of the stats model for each user and update as the user plays more
    
    # Retrive the stats from the frontend first
    if request.method == 'PUT':
        if not request.user.is_authenticated:
            return HttpResponseRedirect(reverse("aliens/index.html"))
        user = request.user
        # Check that the data coming in is from the same user that is currently logged on and playing
        # Do not forget to handle for if the users are not the same
        data_sending_user = User.objects.get(id=user_id)
        if user == data_sending_user: # This is just an extra layer of security incase the user changes any ID on the front end (maybe generate the id in the js dynamically)
            # Convert json object into python json string
            stats_data = json.loads(request.body)
            total_kills = stats_data.get("totalKills", 0)
            total_deaths = stats_data.get("totalDeaths", 0)
            total_bullets_fired = stats_data.get("totalBulletsFired", 0)
            total_games = stats_data.get("totalGames", 0)
            # Might need to add a timer to keep track of how long each game takes (find out a sort of average typing speed)
            # Times in the top ten of the leaderboard
            # top_leaderboard
            # Highest leaderboard position
            # highest_leaderboard 
            # Current leaderboard position
            # current_leaderboard
            # Wins/Loses vs specific friends or a selected rival in a chanllenge
            # head_to_head
            # K/D ratio
            kd_ration = total_kills/total_deaths
            # Add the new variables to the fields in the model and save the new instance
            # If the player has stats then update them. I the player does not have stats yet then create an instance of the stats model where the user is the user making the request
            try:
                player_stats = Stats.objects.get(user=user_id)
            except Stats.DoesNotExist:
                player_stats = Stats(user=user)
            
            player_stats.total_kills += total_kills # I want total overall kills in the model, I get total kills per game from the frontend. I Could also save and display stats based on each game this way.
            player_stats.total_deaths += total_deaths
            player_stats.total_bullets_fired += total_bullets_fired
            player_stats.total_games += total_games
            player_stats.kd_ratio += kd_ration
            
            player_stats.save()
            
            # Update the leaderboard (user_skill_rating)
            user_skill_rating = calculate_skill_score(player_stats.total_kills, player_stats.total_deaths, player_stats.total_bullets_fired, player_stats.total_games)
            try:
                updated_leaderboard = Leaderboard.objects.get(user=user_id)
            except Leaderboard.DoesNotExist:
                # Create a instance if one does not already exsist
                updated_leaderboard = Leaderboard(user=user)
            
            updated_leaderboard.user_skill_rating = user_skill_rating
            # Updates all users ranking on the leaderboard and saves their new rank
            ranking()
            updated_leaderboard.save()
            # Update the users current rank for display
            player_stats.current_position_leaderboard = updated_leaderboard.rank 
            # Return JsonResponse here, needs to first be serialized and include a success message
            
    try:
        player_stats = Stats.objects.get(user=user_id)
    except Stats.DoesNotExist:
        messages.error(request, "You have no stats yet, get playing!")
        return HttpResponseRedirect(reverse('index'))
    
    return render(request, "aliens/stats.html", { # This is called the context
        # Show stats for the specific person that the user typed into the search bar(maybe only friends but then I must find out how to add friends etc, could just be a database field thing)
        # Render: friend name, place on leaderboard, stats from model 
        # K/D ratio
        "player_stats": player_stats,
        # Total Kills all time
        # Head to head with friends/rival
        # Total games played/hours played
        # Total bullets fired
        # Total deaths/failures
        # Highest ever position on the leaderboard
        # Current potition on the leaderboard
        # Amount of times freatured on the top 20 leaderboard
    })

# Sending messages(trach talk)/challenges that is used as the text for the levels
# Might try to make the trash talk in real time whilst watching another users game in a head to head etc
# Maybe have the compose form in the profile page and just do a SPA with that and the inbox/sent
def compose_mail(request): # Must add the accompanying js to handle the posting of the mail or must add the post method to the form
    # Composing a new mail must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    # Check recipient emails
    # Retrive json data from AJAX post of mail content(can do this just from a normal form too)
    data = json.loads(request.body)
    # Strip white space from mail addresses
    # I think I need to change everything from mail to gamertag to suit my app
    # For each reciepient in the data set/json object split by a comma and strip any whitespaces, save into variable called gamertags
    gamertags = [gamertag.strip() for gamertag in data.get("recipients").split(",")]
    # Mail must have at lease one reciepient (emails is mail addresses for each reciepeint)
    if gamertags == [""]:
        return JsonResponse({
            "error": "At least one recipient required."
        }, status=400)

    # Convert mail addresses to users
    # Create and fill recipeints list, reciepients are saved as mail addresses so must convert to users in the User model
    recipients = []
    for gamertag in gamertags:
        try:
            # Getting the user field where the mail address matches the address of the reciepeint, can be more than one
            user = User.objects.get(gamertag=gamertag)
            recipients.append(user)
        except User.DoesNotExist:
            return JsonResponse({
                "error": f"User with gamertag {gamertag} does not exist."
            }, status=400)

    # Get contents of mail
    subject = data.get("subject", "")
    body = data.get("body", "")

    # Create one mail for each recipient, plus sender
    users = set()
    users.add(request.user)
    users.update(recipients)
    for user in users:
        mail = Mail(
            user=user,
            sender=request.user,
            subject=subject,
            body=body,
            read=user == request.user # Bolean to mark the senders mail as read in the sentbox. The comparason returns a bolean expression
        )
        mail.save()
        # For every reciepient of the mail add the users that are the recipients to the new Mail instance then save it
        for recipient in recipients:
            mail.recipients.add(recipient)
        mail.save()

    return JsonResponse({"message": "Mail sent successfully."}, status=201)

def mailbox(request, mailbox):

    # Filter mails returned based on mailbox button controled by js
    if mailbox == "inbox":
        emails = Mail.objects.filter(
            user=request.user, recipients=request.user
        )
    elif mailbox == "sent":
        emails = Mail.objects.filter(
            user=request.user, sender=request.user
        )
    else:
        return JsonResponse({"error": "Invalid mailbox."}, status=400)

    # Return emails in reverse chronologial order
    emails = emails.order_by("-timestamp").all()
    return JsonResponse([mail.serialize() for mail in emails], safe=False)

def mail_details(request, mail_id):

    # Query for requested mail
    try:
        mail = Mail.objects.get(user=request.user, pk=mail_id)
    except Mail.DoesNotExist:
        return JsonResponse({"error": "Mail not found."}, status=404)

    # Return mail contents
    if request.method == "GET":
        return JsonResponse(mail.serialize())

    # Update whether mail is read or should be archived
    elif request.method == "PUT":
        data = json.loads(request.body)
        if data.get("read") is not None:
            mail.read = data["read"]
        mail.save()
        return HttpResponse(status=204)

    # Mail must be via GET or PUT
    else:
        return JsonResponse({
            "error": "GET or PUT request required."
        }, status=400)


# Save scores and add to a leaderboard
# Show leaderboard of high scores
# Allow for posting on another users high score
# For each user record thier different stats
# Display these stats in a functional manner, maybe provide advice on how to be better
# Option to display stats for other users maybe only friends (a way to add friends)
# Implement some sort of debug checking thing
# Make the leaderboard and the graphs a one page thing
# Allow for sending messages, trash talk with a rival (Allow users to challenge each other with their own unique manually entered text)
# U wabt ti create an AI opponent too somehow
# Single page for better user experience:
    # Comments 
    # Sending a mail?
    # Recieving mail notification
    # Liking a comment or liking a leaderboard score
    # Befriending a user
    # These are the nice to have things we can focus on after the initial set up is done
    # Open a new window for messages like gmail, so must always be a mail/compose button on every page