(function(jqueryUrl, callback) {
    if (typeof jqueryUrl !== 'string') {
        jqueryUrl = 
            'https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js';
    }

    if (typeof jQuery === 'undefined') {
        const script = document.createElement('script');
        const head = document.getElementsByTagName('head')[0];
        let done = false;
        script.onload = script.onreadystatechange = (function() {
            if (!done && (!this.readyState || ['load', 'complete'].includes(this.readyState))) {
                done = true;
                script.onload = script.onreadystatechange = null;
                head.removeChild(script);
                callback && callback();
            }
        });

        script.src = jqueryUrl;
        head.appendChild(script);
    }
    else {
        callback && callback();
    }
})(arguments[0], arguments[arguments.length - 1]);