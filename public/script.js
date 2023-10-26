document.addEventListener('DOMContentLoaded', function() {
    
    const input = document.getElementById('numberInput');
    const callButton = document.querySelector('.call-btn');
    const hangButton = document.querySelector('.hang-btn');
    const modal = document.getElementById('modal');
    const modalText = document.getElementById('modal-text');

    let streamRef; 
    let callTimeout;

    modal.style.display = 'none';

    const rd = new RotaryDial({
        size: 1000,
        discFillColor: 'transparent',
        discStrokeColor: 'black',
        circlesFillColor: 'black',
        circlesStrokeColor: 'transparent',
        circlesHighlightColor: 'red',
        textFillColor: 'white',
        textStrokeColor: 'transparent',
        arrowFillColor: 'black',
        arrowStrokeColor: 'transparent',
        callback: function(value) {
            if (input.value.length < 5) {
                input.value += value;
            }
        }
    });

    function showModal(message) {
        modalText.textContent = message;
        modal.style.display = 'block';
    }

    function hideModal() {
        modal.style.display = 'none';
    }

    // Update the connection URL to the Repl.it backend URL
    const socket = io.connect('https://find-me--sairambanoth5.repl.co');

    socket.on('connect', function() {
        console.log('Connected to the server');
    });

    socket.on('connected_to_peer', function() {
        document.body.style.transition = "background-color 0.2s";
        document.body.style.backgroundColor = 'yellow';
        hideModal();

        callTimeout = setTimeout(() => {
            if (streamRef) {
                streamRef.getTracks().forEach(track => track.stop());
            }
            socket.emit('end_call');
        }, 30000);
    });

    socket.on('disconnected_from_peer', function() {
        document.body.style.transition = "background-color 0.2s";
        document.body.style.backgroundColor = 'red';
        setTimeout(() => {
            document.body.style.backgroundColor = '#00c6a3';
        }, 200);
        showModal('Disconnected from the user');
        setTimeout(hideModal, 2000);
        clearInput();
    });

    socket.on('clear_input', function() {
        clearInput();
    });

    callButton.addEventListener('click', function() {
        showModal('Connecting to the user...');
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                streamRef = stream;
                socket.emit('initiate_call', input.value);
            })
            .catch(err => {
                console.warn('Error accessing microphone:', err);
                showModal('Microphone access denied!');
                setTimeout(hideModal, 2000);
            });
    });

    hangButton.addEventListener('click', function() {
        if (streamRef) {
            streamRef.getTracks().forEach(track => track.stop());
        }
        socket.emit('end_call');
        clearTimeout(callTimeout);
    });
});

function clearInput() {
    const input = document.getElementById('numberInput');
    input.value = '';
}
