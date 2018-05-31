document.addEventListener('DOMContentLoaded', function () {

    // Get all "navbar-burger" elements
    var $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);

    // Check if there are any navbar burgers
    if ($navbarBurgers.length > 0) {

        // Add a click event on each of them
        $navbarBurgers.forEach(function ($el) {
            $el.addEventListener('click', function () {

                // Get the target from the "data-target" attribute
                var target = $el.dataset.target;
                var $target = document.getElementById(target);

                // Toggle the class on both the "navbar-burger" and the "navbar-menu"
                $el.classList.toggle('is-active');
                $target.classList.toggle('is-active');

            });
        });
    }

});

import Vue from "vue";
import Buefy from 'buefy';
Vue.use(Buefy);

const navbarApp = new Vue({
    el: "#mainNavbar",
    data: {
        roomLink: ""
    },

    created(){
        this.$data.roomLink = window.location.href;
    },

    methods: {
        copyLink(){
            window.Clipboard = (function(window, document, navigator) {
                var textArea,
                    copy;

                function isOS() {
                    return navigator.userAgent.match(/ipad|iphone/i);
                }

                function createTextArea(text) {
                    textArea = document.createElement('textArea');
                    textArea.value = text;
                    document.body.appendChild(textArea);
                }

                function selectText() {
                    var range,
                        selection;

                    if (isOS()) {
                        range = document.createRange();
                        range.selectNodeContents(textArea);
                        selection = window.getSelection();
                        selection.removeAllRanges();
                        selection.addRange(range);
                        textArea.setSelectionRange(0, 999999);
                    } else {
                        textArea.select();
                    }
                }

                function copyToClipboard() {
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                }

                copy = function(text) {
                    createTextArea(text);
                    selectText();
                    copyToClipboard();
                };

                return {
                    copy: copy
                };
            })(window, document, navigator);

            Clipboard.copy(this.$data.roomLink);
            alert('Link copied to clipboard');
        },
    }
});
