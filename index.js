window.addEventListener("load", ()=>{
    //地図を表示するdiv要素のidを設定
    const w = new World('mapid', [34.98506, 135.7527], 18);

    // キーの押下状態フラグ
    let keys = {};
    window.addEventListener("keydown", e=>{
        keys[e.key] = true;
    });
    window.addEventListener("keyup", e=>{
        keys[e.key] = false;
    });

    // キーが押されていれば移動する
    function animate(){
        if(keys["ArrowLeft"]) w.goLeft();
        if(keys["ArrowRight"]) w.goRight();
        if(keys["ArrowUp"]) w.goUp();
        if(keys["ArrowDown"]) w.goDown();
        requestAnimationFrame(animate);
    }
    animate();

    // madoiに接続し，Worldオブジェクトを登録
    const m = new madoi.Madoi("rooms/mapgame-jlajaslkfj4");
    m.register(w, [
        {method: w.setMarkerPos, share: {maxLog: 100}}, //, type: "afterExec"}},
            // afterExecを指定すると自分の移動のカクつきが改善される。
        {method: w.enterRoom, enterRoom: {}},
        {method: w.peerJoin, peerJoin: {}},
        {method: w.peerLeave, peerLeave: {}}
    ]);
    m.onEnterRoom = selfId=>{
        w.createSelfMarker(selfId, [34.98506, 135.7527]);
    };
});

class World{
    constructor(mapSelector, center, zoom){
        // マップの作成
        this.map = L.map(mapSelector);
        // マップの中心とズームレベルを指定
        this.map.setView(center, zoom);
        // URL(国土地理院データ)を指定してタイルレイヤを作成し地図に追加
        L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
            attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>"
        }).addTo(this.map);

        // 有効なpeerIdを格納するSet
        this.peers = new Set();
        // peerIdとマーカーの対応を格納するMap
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
        this.setMarkerPos(this.selfId, [ll.lat, ll.lng]);
    }

    goDown(){
        const ll = this.getSelfLatLng();
        ll.lat -= 0.00001;
        this.setMarkerPos(this.selfId, [ll.lat, ll.lng]);
    }

    getSelfLatLng(){
        return this.markers.get(this.selfId).getLatLng();
    }

    createSelfMarker(selfId, pos){
        this.selfId = selfId;
        const icon = L.AwesomeMarkers.icon({markerColor: 'green'});
        const m = L.marker(pos, {icon: icon}).addTo(this.map);
        this.markers.set(selfId, m);
        this.setMarkerPos(selfId, pos);
    }

    enterRoom(selfId, peers){
        this.peers.add(selfId);
        peers.forEach(p=>this.peers.add(p.id));
    }

    peerJoin(peerId){
        this.peers.add(peerId);
    }

    peerLeave(peerId){
        this.peers.delete(peerId);
        const m = this.markers.get(peerId);
        if(m){
            m.remove();
            this.markers.delete(peerId);
        }
    }

    setMarkerPos(id, pos){
        if(!this.peers.has(id)) return;
        const latLng = L.latLng(...pos);
        let m = this.markers.get(id);
        if(m){
            m.setLatLng(latLng);
        } else{
            // マーカーが無ければ作成
            const icon = L.AwesomeMarkers.icon({markerColor: 'blue'});
            m = L.marker(pos, {icon: icon}).addTo(this.map);
            this.markers.set(id, m);
        }
        // 自分のマーカーに追随
        if(id == this.selfId){
            this.map.setView(latLng);
        }
    }
}
