# guildreads
A Discord bot for keeping up with Goodreads

## Setup
1. Add Guildreads to your guild (Discord server)
    * Guildreads Invite Link ([Discord](https://discord.com/oauth2/authorize?client_id=1385295938280620152))
2. Set a channel to receive reader list updates using the `/setchannel` command
3. Add a Goodreads user to the reader list using the `/addreader` command
    * To see your own Goodreads user id navigate to your profile and copy the
    series of numbers
    * Example: For user profile page https://www.goodreads.com/user/show/190744187-blake
    the user id is 190744187

## Todo
- [ ] Add more comprehensive setup/documentation generally
    - [ ] Self-hosting documentation
- [ ] Add some unit tests
- [ ] Cleanup code structure
    - [ ] Dynamically add commands from the commands directory
    - [ ] Extract common functionality to utilities
- [ ] Make the embeds prettier
- [ ] Add a linter

