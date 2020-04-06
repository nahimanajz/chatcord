//qs is used to grab value from url query string

const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
//Get username and room from URL
const {username, room} = Qs.parse(location.search,{
ignoreQueryPrefix: true
});
console.log(username, room);

//Message from server
const socket = io();
//Join a room
socket.emit('joinRoom',{username, room});

//get room and users
socket.on('Room users',({room, roomUsers}) => {
  outputRoomName(room);
  outputUsers(roomUsers);
});

socket.on('message', message =>{
outputMessage(message);
});
//Scroll down
chatMessages.scrollTop = chatMessages.scrollHeight;
//message submit
chatForm.addEventListener('submit',(e)=>{
  e.preventDefault();

  //get message from textbox it's ID is msg
  const msg = e.target.elements.msg.value;
  //Emit message to server
  socket.emit('chatMessage',msg);


  //clear input text
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});
  //output message to dom
  function outputMessage(message) {
   const div = document.createElement('div');  
   div.classList.add('message');
   div.innerHTML = `<p class='meta'>${message.username}<span> ${message.time}</span></p>
   <p class="text">${message.text}.
</p>   `; 
document.querySelector('.chat-messages').appendChild(div);
  }
  function outputRoomName(room){
   roomName.innerText = room;
  }
  function outputUsers(users){
  userList.innerHTML = ` 
  ${users.map(user => `<li>${user.username}</li>`).join()}  
  `;
  
}