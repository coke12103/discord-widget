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

var menu = new Gtk.Box();
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

status_text.setLabel("Input your token")
input_area.setBuffer(input_area_buffer)

menu.setOrientation(Gtk.Orientation.VERTICAL);
box.setOrientation(Gtk.Orientation.VERTICAL);
selector_box.setOrientation(Gtk.Orientation.VERTICAL);


input_scroll.add(input_area)
timeline_scroll.add(timeline);
input_area.setWrapMode(Gtk.WrapMode.CHAR);

selector_box.packStart(server_select, true, false, 0)
selector_box.packStart(channel_select, true, false, 0)

box.add(status_text)
box.packStart(selector_box, false, false, 0)
box.packStart(timeline_scroll, true, true, 0)
box.packStart(input_scroll, false, false, 0)
box.add(confirm_button)

confirm_button.on("button-press-event", boot)
input_area.on("key-press-event", post_key_press);

timeline_scroll.setVisible(false);

function boot(event) {
  set_status("Loading...");
  var token = input_area_buffer.text;
  console.log("boot!");

  client.on("ready", () => {
    boot_client();
  });

  client.on("error", error => {
      set_status("Error!")
  })

  client.login(token).then(function(){
      set_status("Ready!");
    }, function(error){
      set_status(error.message);
  });

  client.on('message', msg => {
    update_timeline(msg);
  });
}

function boot_client(){
  console.log("ready!");
  client_status = 1;
  input_area_buffer.text = "";


  var i = 0;
  guilds.map(guild => {
    server_select.insert(i, guild.id, guild.name);
    i++;
    console.log(guild.id);
    console.log(guild.name);
  });

  timeline_scroll.setVisible(true);
  win.showAll();
  server_select.on("changed", update_channel);
  confirm_button.off("button-press-event", boot);
  confirm_button.on("button-press-event", post_message);

//  Keybinder.bind("<Control>Return", post_message)
}
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

  guilds.get(selected_server).channels.get(selected_channel).send(input_area_buffer.text).then(function(){
      set_status("Posted!")
  }, function(error){
      set_status(error.message)
  });
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

function set_status(sts){
  status_text.setText(sts);
}

win.add(box)
win.showAll();
Gtk.main();
