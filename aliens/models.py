from django.core.exceptions import ValidationError
from django.contrib.auth.models import AbstractUser
from django.db import models

# NEED to create a rest API which basically means I need to create a serializer so I do not need to manually serialize json responses. This is basically converting the data into json so that js can read it
# Remeber that js cannott read or manipulate models or field instances straight from the database
class User(AbstractUser):
    name = models.CharField(max_length=64)
    gamertag = models.CharField(max_length=64)
    country = models.CharField(max_length=64)
    profile_pic = models.ImageField(upload_to='profile_pics/', null=True, blank=True, default='static/aliens/spongebob.jpg')

class Stats(models.Model):
    # All time kills .
    total_kills = models.IntegerField(default=0)
    # Times in the top ten of the leaderboard
    times_in_top_ten_leaderboard = models.IntegerField(default=0)
    # Highest leaderboard position
    highest_position_leaderboard = models.IntegerField(default=0)
    # Current leaderboard position
    current_position_leaderboard = models.IntegerField(default=0)
    # Total deaths
    total_deaths = models.IntegerField(default=0)
    # Wins/Loses vs specific friends or a selected rival in a chanllenge
    head_to_head = models.IntegerField(default=0)
    # Bullets fired
    total_bullets_fired = models.IntegerField(default=0)
    # Games played
    total_games = models.IntegerField(default=0)
    # K/D ratio
    kd_ratio = models.IntegerField(default=0)
    # Link stats to user model
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_stats')
    
    def stats_serialize(self):
        return {
            "id": self.id,
            "total_kills": self.total_kills,
            "total_deaths": self.total_deaths,
            "total_games": self.total_games,
            "total_bullets": self.total_bullets_fired,
            "kd_ratio": self.kd_ratio,
            "times_in_top_ten_leaderboard": self.times_in_top_ten_leaderboard,
            "highest_position_leaderboard": self.highest_position_leaderboard,
            "current_position_leaderboard": self.current_position_leaderboard,      
        }        
    
class Leaderboard(models.Model): # I do not think this model is neccessary, just do the calculations and display from the stats model and fields
    # Link stats to user model
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_leaderboard')
    # Skill rating to sort the leaderboard based on the skill rating calculation function
    user_skill_rating = models.IntegerField(default=0)
    rank = models.IntegerField(default=0)
    # The leaderboard maybe top 20:
    # Kills
    # K/D ration
    # Games played
    # Deaths
    # Overall (some sort of calculation)
    
    # Leaderboard Necessity:
    # You need to store historical leaderboard data.
    # The leaderboard calculation is resource-intensive and you want to update it periodically instead of calculating it on-the-fly.
    # You wish to include additional metadata specific to leaderboard rankings.
    # def get_leaderboard(self):
    def leaderboard_serialize(self):
        return{
            "id": self.id,
            "gamertag": self.user.gamertag,
            "user_skill_rating": self.user_skill_rating,
            "user_rank": self.rank,
        }
    
class Post(models.Model):
    # Post a challenge to the main page maybe?
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_posts') # Links the post to the user that made the post
    # Content can be made to be the text in the game as a challenge by the other user or posts can be content added to a persons run of the game or to their stats page or the leaderboard
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    # A way to share results or specific runs
    # Comments
    # Likes for comments etc
    def post_serialize(self):
        return {
            "id": self.id,
            "posted_by": self.user.username,
            "content": self.content,
            "created_at": self.created_at,
        }
    
class Mail(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="emails")
    sender = models.ForeignKey("User", on_delete=models.CASCADE, related_name="emails_sent")
    recipients = models.ManyToManyField("User", related_name="recipient_gamertag")
    subject = models.CharField(max_length=255)
    body = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)
    
    # One instance/Email at a time
    def serialize(self):
        return {
            "id": self.id,
            "sender": self.sender.gamertag, # Need to remember that email refers to a field in the abstract user that is their email address
            # Remember that Email.recipeints.all gives you all the User model instances related to recipient through the foreign key
            "recipients": [user.gamertag for user in self.recipients.all()], # Multiple reciepients means must iterate through to find each one of their email addresses
            "subject": self.subject,
            "body": self.body,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "read": self.read,
        }
        
# Create a new model for the helpWanted table. User foreign key relationship, gamertag, game they need help with etc...
class HelpWantedTable(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_help_wanted_table')
    gamertag = models.CharField(max_length=64)
    game = models.CharField(max_length=64)
    game_day = models.CharField(max_length=64, default='Monday')
    
    def help_wanted_table_serialize(self):
        return {
            "id": self.id,
            "gamertag": self.gamertag,
            "game": self.game,
            "game_day": self.game_day,
        }
