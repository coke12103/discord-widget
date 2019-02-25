const gi = require("node-gtk");
Gtk = gi.require('Gtk', '3.0');
Gdk = gi.require('Gdk', '3.0');
// ↓動いてくれ頼むから。
//Keybinder = gi.require('Keybinder');
const Discord = require('discord.js');
const client = new Discord.Client();

gi.startLoop()
Gtk.init()
//Keybinder.init()

const win = new Gtk.Window();

win.on('destroy', function(){
  Gtk.mainQuit();
  client.destroy();
})
win.on('delete-event', () => false)

win.setDefaultSize(300, 280)
win.setTitle("Hello, World!")

const box = new Gtk.Box();

var status_text = new Gtk.Label()
var input_scroll = new Gtk.ScrolledWindow()
var input_area = new Gtk.TextView()
var input_area_buffer = new Gtk.TextBuffer()
var confirm_button = new Gtk.Button({ label: "Send!" })
var selector_box = new Gtk.Box();
var server_select = new Gtk.ComboBoxText();
var channel_select = new Gtk.ComboBoxText();
var timeline_scroll = new Gtk.ScrolledWindow();
var timeline = new Gtk.ListBox();

var client_status = 0;

var guilds = client.guilds;

status_text.setLabel("Input Token")
input_area.setBuffer(input_area_buffer)

box.setOrientation(Gtk.Orientation.VERTICAL);
selector_box.setOrientation(Gtk.Orientation.VERTICAL);

input_scroll.add(input_area)
timeline_scroll.add(timeline)
input_area.setWrapMode(Gtk.WrapMode.CHAR);

selector_box.packStart(server_select, true, false, 0)
selector_box.packStart(channel_select, true, false, 0)
server_select.setVisible(false);
channel_select.setVisible(false);

box.add(status_text)
box.add(selector_box)
box.packStart(timeline_scroll, true, false, 0)
box.packStart(input_scroll, true, false, 0)
box.add(confirm_button)

confirm_button.on("button-press-event", boot)
input_area.on("key-press-event", post_key_press);

timeline_scroll.setVisible(false);

function boot(event) {
  status_text.setText("Loading...");
  var token = input_area_buffer.text;
  console.log("boot!");

  client.on("ready", () => {
    boot_client();
  });

  client.on("error", error => {
      status_text.setText("Error!")
  })

  client.login(token);;

  client.on('message', msg => {
    update_timeline(msg);
  });
}

function boot_client(){
  console.log("ready!");
  client_status = 1;
  input_area_buffer.text = "";
  status_text.setText("Ready!");

  var i = 0;
  guilds.map(guild => {
    server_select.insert(i, guild.id, guild.name);
    i++;
    console.log(guild.id);
    console.log(guild.name);
  });

  server_select.setVisible(true);
  channel_select.setVisible(true);
  timeline_scroll.setVisible(true);
  win.showAll();
  server_select.on("changed", update_channel);
  confirm_button.off("button-press-event", boot);
  confirm_button.on("button-press-event", post_message);

//  Keybinder.bind("<Control>Return", post_message)
}
//function update_channel(guild, server_select){
function update_channel(){
  var selected_server = server_select.getActiveId();
  console.log("Select: " + server_select.getActiveText());
  console.log("ID: " + selected_server);

  guilds.map(guild => {
    if(guild.id === selected_server) {
      var channels = guild.channels;
      var i = 0;
      channel_select.removeAll();
      channels.map(channel => {
        if(channel.type === "text"){
          channel_select.insert(i, channel.id, channel.name);
        }
      })
    }
  });
  win.showAll();
}

function post_message(){
  var selected_server = server_select.getActiveId();
  var selected_channel = channel_select.getActiveId();

  guilds.get(selected_server).channels.get(selected_channel).send(input_area_buffer.text)
  input_area_buffer.setText("", 0);
};

function post_key_press(event){
  if(event.keyval == Gdk.KEY_Escape){
    switch (client_status){
      case 0:
        boot();
        break;
      case 1:
        post_message();
        break;
    }
  }
}

function update_timeline(msg){
  var message = "<" + msg.author.username + "@" + msg.guild.name + ":" + msg.channel.name+ "> " + msg.content
  var mes = new Gtk.Label();
  mes.setLabel(message)
  mes.setXalign(0);
  console.log(message)
  timeline.insert(mes, 0);
  win.showAll();
}

win.add(box)
win.showAll();
Gtk.main();
