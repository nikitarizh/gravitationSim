class NotificationsHelper {
    notificationsDiv;

    constructor() {
        this.notificationsDiv = document.getElementsByClassName('notification')[0];
    }

    new(status, text) {
        let color = (status == 200 || status == 'OK') ? COLOR_GREEN : COLOR_YELLOW;
        let div = document.createElement('div');
        div.style.color = color;
        div.innerHTML = text;
        this.notificationsDiv.appendChild(div);
        setTimeout(function(t) {
            div.remove();
        }, 3000, this);
    }
}