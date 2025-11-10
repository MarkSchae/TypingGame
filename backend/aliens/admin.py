from django.contrib import admin

# Register your models here.
from .models import User, Post, Stats, Leaderboard, Mail, HelpWantedTable

admin.site.register(User)
admin.site.register(Post)
admin.site.register(Stats)
admin.site.register(Leaderboard)
admin.site.register(Mail)
admin.site.register(HelpWantedTable)
