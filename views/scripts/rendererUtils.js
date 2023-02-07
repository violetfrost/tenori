/*
Resolves data on a kanji using kanjiapi.dev
TODO: Explore better ways to get data from multiple kanji at once.
*/
ResolveKanjiData = function(char)
{
    return new Promise((resolve, reject) => {
        var url ="https://kanjiapi.dev/v1/kanji/" + char
        var xhr = new XMLHttpRequest();

        xhr.open('GET', url, true);
        xhr.responseType = 'json';
        xhr.onload = function() {
          var status = xhr.status;
          if (status === 200) {
            resolve(xhr.response);
          } else {
            reject();
          }
        };

        xhr.send();
    });
}