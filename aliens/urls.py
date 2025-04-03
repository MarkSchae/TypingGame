from django.urls import path


from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("compose_mail", views.compose_mail, name="compose_mail"),
    path("game", views.game, name="game"),
    path("leaderboard", views.leaderboard, name="leaderboard"),
    path("help_wanted", views.help_wanted, name="help_wanted"),
    
    
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("delete", views.delete_account, name="delete_account"),
    
    
    path("player_profile/<int:user_id>", views.player_profile, name="player_profile"),
    path("players_stats/<int:user_id>", views.players_stats, name="players_stats"),
    path("mails/<int:mail_id>", views.mail_details, name="mail_details"),
    path("mails/<str:mailbox>", views.mailbox, name="mailbox"),   
    path("chat/<str:room_name>", views.room, name="room"),
] 

