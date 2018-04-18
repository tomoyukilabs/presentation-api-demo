const _buttons = {};
const _presentation = {
  request: window.PresentationRequest ? new PresentationRequest('./viewer.html') : null,
  connection: null
};

const checkAvailability = evt => {
  _buttons.connect.disabled = !evt.target.value;
};

const connectDisplay = async () => {
  try {
    _buttons.connect.disabled = true;
    _presentation.connection = await _presentation.request.start();
    _presentation.connection.addEventListener('connect', displayConnected);
    _presentation.connection.addEventListener('terminate', displayTerminated);
  } catch (e) {
    // do nothing when no presentation display is connected
    _buttons.connect.disabled = false;
  }
};

const changeImage = () => {
  _buttons.change.disabled = true;
  _presentation.connection.send('change');
};

const disconnectDisplay = async () => {
  if (_presentation.connection.state !== 'closed') {
    _presentation.connection.terminate();
  }
  else {
    _presentation.connection.addEventListener('connect', () => {
      _presentation.connection.terminate();
    });
    _presentation.connection.reconnect(_presentation.connection.id);
  }
};

const displayConnected = () => {
  _buttons.connect.removeEventListener('click', connectDisplay);
  _buttons.connect.addEventListener('click', disconnectDisplay);
  _buttons.connect.classList.add('connected');
  _buttons.connect.disabled = false;
  _presentation.connection.addEventListener('message', imageLoaded);
};

const displayTerminated = () => {
  _buttons.connect.addEventListener('click', connectDisplay);
  _buttons.connect.classList.remove('connected');
  _buttons.connect.disabled = false;
  _buttons.change.disabled = true;
};

const imageLoaded = evt => {
  if (evt.data === 'loaded')
    _buttons.change.disabled = false;
};

document.addEventListener('DOMContentLoaded', async () => {
  _buttons.connect = document.getElementById('connect');
  _buttons.change = document.getElementById('change');
  if (!_presentation.request) {
    alert('This browser does not support Presentation API.');
    return;
  }
  _buttons.connect.addEventListener('click', connectDisplay);
  _buttons.change.addEventListener('click', changeImage);
  const availability = await _presentation.request.getAvailability();
  _buttons.connect.disabled = !availability.value;
  availability.addEventListener('change', checkAvailability);
});

window.addEventListener('unload', () => {
  if (_presentation.connection)
    disconnectDisplay();
})
