window.addEventListener("load", ()=>{
    //地図を表示するdiv要素のidを設定
    const w = new World('mapid');
    const m = new madoi.Madoi("rooms/mapgame-jlajaslkfj4");
    m.register(w, [
        {method: w.setMarkerPos, share: {maxLog: 100}}
    ]);
    m.onEnterRoom = ()=>{
        w.setSelfMarkerPos([34.98506, 135.7527])
    };
    let keys = {};
    window.addEventListener("keydown", e=>{
        keys[e.key] = true;
    });
    window.addEventListener("keyup", e=>{
        keys[e.key] = false;
    });
    function animate(){
        if(keys["ArrowLeft"]) w.goLeft();
        if(keys["ArrowRight"]) w.goRight();
        if(keys["ArrowUp"]) w.goUp();
        if(keys["ArrowDown"]) w.goDown();
        requestAnimationFrame(animate);
    }
    animate();
});
class World{
    constructor(mapSelector){
        this.map = L.map(mapSelector);
        //地図の中心とズームレベルを指定
        this.map.setView([34.98506, 135.7527], 18);
        //表示するタイルレイヤのURLとAttributionコントロールの記述を設定して、地図に追加する
        L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
            attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>"
        }).addTo(this.map);

        this.selfId = this.generateUuid();
        this.markers = new Map();
    }

    goLeft(){
        const ll = this.getSelfLatLng();
        ll.lng -= 0.00001;
        this.setMarkerPos(this.selfId, [ll.lat, ll.lng]);
    }

    goRight(){
        const ll = this.getSelfLatLng();
        ll.lng += 0.00001;
        this.setMarkerPos(this.selfId, [ll.lat, ll.lng]);
    }

    goUp(){
        const ll = this.getSelfLatLng();
        ll.lat += 0.00001;
        this.setSelfMarkerPos([ll.lat, ll.lng]);
    }

    goDown(){
        const ll = this.getSelfLatLng();
        ll.lat -= 0.00001;
        this.setSelfMarkerPos([ll.lat, ll.lng]);
    }

    getSelfLatLng(){
        return this.markers.get(this.selfId).getLatLng();
    }

    setSelfMarkerPos(pos){
        this.setMarkerPos(this.selfId, pos);
    }

    setMarkerPos(id, pos){
        const latLng = L.latLng(...pos);
        let m = this.markers.get(id);
        if(m){
            m.setLatLng(latLng);
        } else{
            m = L.marker(pos).addTo(this.map);
            this.markers.set(id, m);
        }
        if(id == this.selfId)
            this.map.setView(latLng);
    }

    generateUuid() {
        // https://github.com/GoogleChrome/chrome-platform-analytics/blob/master/src/internal/identifier.js
        // const FORMAT: string = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
        let chars = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".split("");
        for (let i = 0, len = chars.length; i < len; i++) {
            switch (chars[i]) {
                case "x":
                    chars[i] = Math.floor(Math.random() * 16).toString(16);
                    break;
                case "y":
                    chars[i] = (Math.floor(Math.random() * 4) + 8).toString(16);
                    break;
            }
        }
        return chars.join("");
    }
}
