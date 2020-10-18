const Discord = require('discord.js')
const bot = new Discord.Client();

const token = 'NzY3MjEzMDYzMDU2Nzg1NDE5.X4uo2A.szPjYsexsOTKGaSqPtSFlu6KdF8'
const PREFIX = '!'
const ytdl = require("ytdl-core")

var servers = {}

bot.login(token)

bot.on('ready', () => {
    console.log('Bot is online');
})

bot.on('message', message=>{
    
    let args = message.content.substring(PREFIX.length).split(" ")

    switch (args[0]) {
        //Person writes !play
        case 'play':

            function play(connection, message){
                var server = servers[message.guild.id];

                server.dispatcher = connection.play(ytdl(server.queue[0],{filter: "audioonly"}))
                server.queue.shift()
                server.dispatcher.on("end",function(){
                    if(server.queue[0]){
                        play(connection, message)
                    } else {
                        connection.disconnect();
                    }
                })
                
            }
            //Checks to see if there is a second argument
            if(!args[1]){
                message.channel.send("You need to provide a link!")
                return
            }

            if(!message.member.voice.channel){
                message.channel.send("You must be in the voice channel to play the bot!")
                return
            } 
            

            if(!servers[message.guild.id]) servers[message.guild.id] = {
                queue: []
            }

            var server = servers[message.guild.id];
            server.queue.push(args[1])

            if(!message.member.voice.connection) message.member.voice.channel.join().then(function(connection){
                play(connection, message);

            })
        
        break;

        case 'skip':
            var server = servers[message.guild.id];
            if(server.dispatcher) server.dispatcher.end()
            message.channel.send("Skipping song")
        break

        case 'stop':
            var server = servers[message.guild.id];
            if(message.guild.voice.connection){
                for(var i = server.queue.length-1; i >= 0; i--){
                    server.queue.splice(i,1)
                }

                server.dispatcher.end()
                message.channel.send("Ending the queue, leaving the voice channel")
                console.log('stopped the queue')
            }

            if(message.guild.connection) message.guild.voice.connection.disconnect()
        break;
    }
})