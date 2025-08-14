const NotificationSound = {
  mount: function() {
    window.ion.sound({
      sounds: [
        {
          name: "button_tiny"
        }
      ],
      path: "/assets/audio/",
      preload: true,
      volume: 0.5,
      multiplay: true
    });
  },
  play: function(sound = "button_tiny") {
    if (window.ion && window.ion.sound) {
        console.log('ion.sound is loaded');
    } else {
        console.log('ion.sound is not loaded');
    }
    window.ion.sound.play(sound);
  }
};

export default NotificationSound;
