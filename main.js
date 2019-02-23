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
win.setPosition(Gtk.WindowPosition.CENTER)

const box = new Gtk.Box();

var status_text = new Gtk.Label()
var input_scroll = new Gtk.ScrolledWindow()
var input_area = new Gtk.TextView()
var input_area_buffer = new Gtk.TextBuffer()
var confirm_button = new Gtk.Button({ label: "Send!" })
var selector_box = new Gtk.Box();
var server_select = new Gtk.ComboBoxText();
var channel_select = new Gtk.ComboBoxText();

var client_status = 0;

var guilds = client.guilds;

status_text.setLabel("Input Token")
input_area.setBuffer(input_area_buffer)

box.setOrientation(Gtk.Orientation.VERTICAL);
selector_box.setOrientation(Gtk.Orientation.VERTICAL);

input_scroll.add(input_area)
input_area.setWrapMode(Gtk.WrapMode.CHAR);

selector_box.packStart(server_select, true, false, 0)
selector_box.packStart(channel_select, true, false, 0)
server_select.setVisible(false);
channel_select.setVisible(false);

box.add(status_text)
box.add(selector_box)
box.packStart(input_scroll, true, false, 0)
box.add(confirm_button)

confirm_button.on("button-press-event", boot)
input_area.on("key-press-event", post_key_press);

function boot(event) {
  var token = input_area_buffer.text;
  console.log("boot!");

  client.on("ready", () => {
    boot_client();
  });

  client.login(token);

  client.on('message', msg => {
    console.log("<" + msg.author.username + "@" + msg.guild.name + ":" + msg.channel.name+ "> " + msg.content);
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

  guilds.map(guild => {
    if(guild.id === selected_server){
      guild.channels.map(channel => {
        if(channel.id === selected_channel){
          channel.send(input_area_buffer.text);
          input_area_buffer.setText("", 0);
        };
      });
    };
  });
};

function post_key_press(event){
  if(event.keyval == Gdk.KEY_Escape){
    if(client_status == 0){
      boot();
    }
    if(client_status == 1){
      post_message();
    }
  }
//  console.log(event.string)
//  console.log(event.keyval)
//  console.log(event)
//  console.log(event.state)
//  console.log(Gdk.ModifierType.CONTROL_MASK)
//  console.log(event.state == Gdk.ModifierType.CONTROL_MASK)
//  console.log(event.keyval == Gdk.KEY_Return)
//  console.log(Gdk.Key.Return)
//  console.log(Gdk.KEY_Return)
//  console.log("CONTROL_MASK: " + Gdk.ModifierType.CONTROL_MASK)
//  console.log("ControlMask: " + Gdk.ModifierType.ControlMask)
//  console.log("event.state: " + event.state)
  //if(event.state == )
  //if ((event.state &amp; gtk.gdk.CONTROL_MASK) == gtk.gdk.CONTROL_MASK) and (event.keyval==gtk.keysyms.Return):
}

win.add(box)
win.showAll();
Gtk.main();
