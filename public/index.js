require('./jquery')

var peer;
$(main)
function main() {
  $('#shareurl').val(window.location + '');
  $('#shareurl').focus(function() { $(this).select() })

  var cons = []
  var images = [];

  var opts = { port: 9000, host: '/', debug: false }
  var reliable = true;
  var copts = { reliable: reliable }
  var id = (window.location.pathname + '').replace(/\//g, '0')
  console.log('woo! My ID is', id)
  peer = new Peer(id, opts);

  // PARENT
  peer.on('connection', function(con) {
    con.on('open', function() {
      cons.push(con)
      $('p').first().prepend('<div>Someone connected; they\'ll get your images!</div>')


      console.log('PARENT con on open', con)

      if (images.length) {
        console.log('PARENT sending to ', con, images)
        con.send(images)
      }
      // con.send('hihi')
    })
    con.on('data', function(d) {
      // if array, put all images in DOM, add to own images array
      // if single blob, put single image in
      console.log('PARENT got stuff from child!')
      if (d.constructor == [].constructor) {
        return d.map(insertImage);
      }
      return insertImage(d)
    })
  })

  // CHILD
  peer.on('error', function(e) {
    if ('unavailable-id' === e.type) {
      peer = new Peer(null, opts)
      var con = peer.connect(id, copts)
      con.on('open', function() {
        cons.push(con)
        console.log('CHILD wee! My ID is', peer.id)
        console.log('CHILD connected to', id)
      })
      con.on('data', function(d) {
        console.log('CHILD got data from', id, d)
        if (d.constructor == [].constructor) {
          return d.map(insertImage);
        }
        return insertImage(d)
      })
      // TODO on end of connection, periodically try to reconnect to parent.
      // peer.on('connection', function(con) {
      //   con.on('open', function() {
      //     if (images.length) {
      //       console.log('CHILD sending to ', con, images)
      //       return con.send(images)
      //     }
      //   })
      // })
      return
    }
    console.log(e, e.stack);
  })

  //
  // when file added, send to peers
  //
  var input = $('input').first()
  input.change(function(e) {
    for (var i = 0; i < input[0].files.length; i++) {
      var file = input[0].files[i]
      var url = URL.createObjectURL(file)
      // console.log(file)
      // console.log(url)
      $('<img>', { src: url }).appendTo('body')

      images.push(file)
      if (cons.length) {
        console.log('sending to ', cons, file)
        cons.forEach(function(con) {
          con.send(file)
        })
        return
      }
      console.log('Not sent; no one connected')
    }
  })

  // stolen from cdn.peerjs.com/demo/chat.html
  function insertImage (data) {
    // If we're getting a file, create a URL for it.
    if (data.constructor === ArrayBuffer) {
      var dataView = new Uint8Array(data);
      var dataBlob = new Blob([dataView]);
      var url = URL.createObjectURL(dataBlob);
      $('<img>', { src: url }).appendTo('body');
      if (~images.indexOf(dataBlob)) return
      images.push(dataBlob);
      console.log('insertImage', images)
    }
  }
}

  // Make sure things clean up properly.
  // window.onunload = window.onbeforeunload = function(e) {
  //   if (!!peer && !peer.destroyed) {
  //     peer.destroy()
  //   }
  // };
