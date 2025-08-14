import { useEffect, useState } from "react";
import Notification from 'react-web-notification';
import NotificationSound from "../../../services/notificationSound";

const DesktopNotification = (props) => {
  const [ignore, setIgnore] = useState(true);
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState('');
  const [body, setBody] = useState('');
  const [options, setOptions] = useState({});

  useEffect(() => {
    if (props.showNotification === "true") {
      const now = Date.now();
      const title = props.title;
      const tag = props.tag || now;
      const body = props.body;
      displayDesktopNotification(title, tag, body);
    }
  }, [props.showNotification]);

  const handlePermissionGranted = () => {
    setIgnore(false);
  }

  const handlePermissionDenied = () => {
    setIgnore(true);
  }

  const handleNotSupported = () => {
    setIgnore(true);
  }

  const handleNotificationOnClick = (e, tag) => {
    window.focus();
    props.onNotificationClick(e, tag);
  }

  const handleNotificationOnClose = (e, tag) => {
    console.log('Notification closed');
  }

  const handleNotificationOnShow = (e, tag) => {
    playSound();
  }

  const playSound = () => {
    NotificationSound.mount();
    NotificationSound.play();
  }

  const displayDesktopNotification = (title, tag, body) => {
    if (ignore) return;

    const icon = "/logo512.png";
    const options = {
      tag: tag,
      body: body,
      icon: icon,
      lang: 'en',
      dir: 'ltr',
      sound: './sound.mp3',
    };

    setTitle(title);
    setOptions(options);
    props.onDisplayNotification();
  }

  return (
    <div>
      <Notification
        notSupported={handleNotSupported}
        onPermissionGranted={handlePermissionGranted}
        onPermissionDenied={handlePermissionDenied}
        onShow={handleNotificationOnShow}
        onClick={handleNotificationOnClick}
        onClose={handleNotificationOnClose}
        timeout={null}  // Prevent auto-closing
        title={title}
        options={options}
      />
    </div>
  );
};

export default DesktopNotification;
