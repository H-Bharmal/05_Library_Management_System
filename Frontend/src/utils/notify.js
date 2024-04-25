function notify(message, color='green'){
    // Create the notification element
const notification = document.createElement('div');
notification.classList.add('notification');
notification.textContent = message;

// Style the notification element
notification.style.position = 'fixed';
notification.style.top = '20px';
notification.style.right = '20px';
notification.style.backgroundColor = color;
notification.style.color = 'white';
notification.style.padding = '10px';
notification.style.borderRadius = '5px';
notification.style.zIndex = '9999';

// Append the notification to the body
document.body.appendChild(notification);

// Set a timeout to remove the notification after 3 seconds (adjust as needed)
setTimeout(() => {
    notification.remove();
}, 3000);

}

export {notify};