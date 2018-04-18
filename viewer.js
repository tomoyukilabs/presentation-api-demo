const _presentation = {
  connection: null,
  loading: true
};

const _ui = {
  viewer: null,
  current: null,
  previous: null
};

const imageLoaded = () => {
  _ui.current.removeEventListener('animationend', imageLoaded);
  if (_ui.previous) {
    _ui.viewer.removeChild(_ui.previous);
  }
  _presentation.loading = false;
  _presentation.connection.send('loaded');
};

const loadImage = () => {
  const r = window.devicePixelRatio && 1;
  const w = Math.floor(screen.width * devicePixelRatio);
  const h = Math.floor(screen.height * devicePixelRatio);
  const img = new Image();
  img.src = 'https://picsum.photos/' + w + '/' + h + '?random&timestamp=' + Date.now();
  img.addEventListener('load', () => {
    _ui.viewer.appendChild(img);
  });
  _ui.previous = _ui.current;
  _ui.current = img;
  img.addEventListener('animationend', imageLoaded);
};

const changeImage = evt => {
  if (!_presentation.loading && evt.data === 'change') {
    _presentation.loading = true;
    loadImage();
  }
};

const connectionFound = connection => {
  _presentation.connection = connection;
  _presentation.connection.addEventListener('message', changeImage);
  loadImage();
};

document.addEventListener('DOMContentLoaded', async () => {
  _ui.viewer = document.getElementById('viewer');
  if (navigator.presentation && navigator.presentation.receiver) {
    const list = await navigator.presentation.receiver.connectionList;
    if (list.connections.length > 0) {
      connectionFound(list.connections[0]);
    }
    else {
      list.addEventListener('connectionavailable', evt => {
        if (!_presentation.connection) {
          connectionFound(evt.connection);
        }
      });
    }
  }
});