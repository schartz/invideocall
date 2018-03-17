import Vue from 'vue';
import Buefy from 'buefy';
Vue.use(Buefy);

let boxUsed = [true, false, false, false];
let activeBox = -1;  // nothing selected
let aspectRatio = 4/3;  // standard definition video aspect ratio
let maxCALLERS = 3;
let numVideoOBJS = maxCALLERS+1;
let layout;

const videoCall = new Vue({
    el: '#videoCall',
    data: {
        micOn: 1,
        camOn: 1,
        users: [],
        roomName: window.location.pathname.substring(1)
    },

    created(){
        this.startVideoConference();
    },

    methods: {
        startVideoConference(){
            const self = this;
            const myRoomName = this.$data.roomName;
            easyrtc.setRoomOccupantListener(self.callEverybodyElse);
            easyrtc.easyApp("easyrtc.multiparty", "box0", ["box1", "box2", "box3"], self.loginSuccess);

            easyrtc.joinRoom(  myRoomName, {},
                function() {  console.log("success");},
                function(errorCode, errorText, roomName) {
                    easyrtc.showError(errorCode, errorText + ": room name was(" + roomName + ")");
                });



            easyrtc.setPeerListener(self.messageListener);
            easyrtc.setDisconnectListener( function() {
                easyrtc.showError("LOST-CONNECTION", "Lost connection to signaling server");
            });
            easyrtc.setOnCall( function(easyrtcid, slot) {
                console.log("getConnection count="  + easyrtc.getConnectionCount() );
                boxUsed[slot+1] = true;
                if(activeBox == 0 ) { // first connection
                    collapseToThumb();
                    document.getElementById('textEntryButton').style.display = 'block';
                }
                document.getElementById(self.getIdOfBox(slot+1)).style.visibility = "visible";
                //handleWindowResize();
            });


            easyrtc.setOnHangup(function(easyrtcid, slot) {
                boxUsed[slot+1] = false;
                if(activeBox > 0 && slot+1 == activeBox) {
                    collapseToThumb();
                }
                setTimeout(function() {
                    document.getElementById(self.getIdOfBox(slot+1)).style.visibility = "hidden";

                    if( easyrtc.getConnectionCount() == 0 ) { // no more connections
                        expandThumb(0);
                        document.getElementById('textEntryButton').style.display = 'none';
                        document.getElementById('textentryBox').style.display = 'none';
                    }
                    handleWindowResize();
                },20);
            });
        },

        callEverybodyElse(roomName, otherPeople) {

            easyrtc.setRoomOccupantListener(null); // so we're only called once.

            let list = [];
            let connectCount = 0;
            for (let easyrtcid in otherPeople) {
                list.push(easyrtcid);
            }
            //
            // Connect in reverse order. Latter arriving people are more likely to have
            // empty slots.
            //
            function establishConnection(position) {
                function callSuccess() {
                    connectCount++;
                    if (connectCount < maxCALLERS && position > 0) {
                        establishConnection(position - 1);
                    }
                }

                function callFailure(errorCode, errorText) {
                    easyrtc.showError(errorCode, errorText);
                    if (connectCount < maxCALLERS && position > 0) {
                        establishConnection(position - 1);
                    }
                }

                easyrtc.call(list[position], callSuccess, callFailure);

            }

            if (list.length > 0) {
                establishConnection(list.length - 1);
            }
        },

        messageListener(easyrtcid, msgType, content) {
            alert(content);
            console.log(msgType);
        },

        loginSuccess(){
            return true;
        },

        getIdOfBox(boxNum) {
            return "box" + boxNum;
        },

        setCamOn() {
            this.$data.camOn = 1;
            easyrtc.enableCamera(true);
        },
        setCamOff() {
            this.$data.camOn = 0;
            easyrtc.enableCamera(false);
        },
        setMicOn() {
            this.$data.micOn = 1;
            easyrtc.enableMicrophone(true);
        },
        setMicOff() {
            this.$data.micOn = 0;
            easyrtc.enableMicrophone(false);
        },
        leaveCall(){
            easyrtc.disconnect();
            window.location.href = window.location.protocol + '//' + window.location.hostname;
        }
    }
})
