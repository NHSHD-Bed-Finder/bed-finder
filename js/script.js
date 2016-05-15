var parsedData = [];
var dataRow = [];


function parseRequestData(dataIn){
  var dataInLength = dataIn.length;
  var i;
  var dataOut = [];
  var dataRow;

  for (i=0; i<dataInLength; i++){
    dataRow = dataIn[i];
    dataOut.push([
      dataRow.id,
      dataRow.originId,
      dataRow.destinationTrust.name,
      dataRow.patient,
      dataRow.beds_type1,
      dataRow.beds_type2,
      dataRow.beds_type3,
      dataRow.accepted,
      dataRow.rejected,
      dataRow.cancelled
    ]);

  }
  return dataOut;
}


// var parsedDataRow = [];

$(document).ready(function() {


  var worklist = null;
  var example = null;


  $( "#overview-page" ).on( "pageshow", function( event ) {
    $('#acceptButton').prop('disabled', true);
    $('#rejectButton').prop('disabled', true);
    if (example) {
      console.log('destroying example');
      example.clear();
      example.destroy();
    }

    $.ajax({
      url: "https://camhs-api.herokuapp.com/trusts",
      // data: formData,
      type: 'GET',
      dataType: 'json',
      success:function(results){
        overviewDataLoaded = true;
        var i;
        for (i=0; i<results.length; i++){
          dataRow = results[i];
          parsedData.push([
            // dataRow.id,
            dataRow.name,
            dataRow.location,
            // dataRow.region,
            dataRow.postcode,
            dataRow.beds_type1,
            dataRow.beds_type2,
            dataRow.beds_type3,
            dataRow.beds_available_type1,
            dataRow.beds_available_type2,
            dataRow.beds_available_type3
            // dataRow.latitude,
            // dataRow.longitude,
            // dataRow.distance
          ]);
        }
        example = $('#example').DataTable( {
          data: parsedData,
          "scrollX": true,
          columns: [
            // { title: "id" },
            { title: "name" },
            { title: "location" },
            // { title: "region" },
            { title: "postcode" },
            { title: "General" },
            { title: "PICU" },
            { title: "Secure" },
            { title: "General-Avail" },
            { title: "PICU-Avail" },
            { title: "Secure-Avail" }
            // { title: "latitude" },
            // { title: "longitude" },
            // { title: "distance" }
          ]
        });

        $('#example').on( 'click', 'tr', function () {
          $('#acceptButton').prop('disabled', false);
          $('#rejectButton').prop('disabled', false);
          if ( $(this).hasClass('selected') ) {
              $(this).removeClass('selected');
          }
          else {
              example.$('tr.selected').removeClass('selected');
              $(this).addClass('selected');
          }
        });
      } // end of ajax success function
    });
  });

  var referralsLoaded = false;
  function updateReferrals(){
    $.ajax({
      url: "https://camhs-api.herokuapp.com/requests?status=active",
      dataType: 'json',
      success:function(results){
        var parsedData = parseRequestData(results);
        if (worklist) {
          worklist.destroy();
          worklist.rows.add(parsedData);
        }

        $('#acceptButton').prop("disabled",true);
        $('#rejectButton').prop("disabled",true);

        worklist = $('#workList').DataTable( {
          data: parsedData,
          "scrollX": true,
          columns: [
            { title: "id", "visible": false },
            { title: "originId" },
            { title: "destination" },
            { title: "patient" },
            { title: "General" },
            { title: "PICU" },
            { title: "Secure" },
            { title: "accepted" },
            { title: "rejected" },
            { title: "cancelled" }
          ]
        });
        if (!referralsLoaded){
          $('#acceptButton').click( function (args1, args2) {
            var rowId = worklist.row('.selected').data()[0]
            // console.log('deleting ' + worklist.row('.selected').data()[0]);
            $('#acceptButton').prop("disabled",true);
            $('#rejectButton').prop("disabled",true);
            // worklist.row('.selected').remove().draw( false );

            $.ajax({
              url: "https://camhs-api.herokuapp.com/request/"+rowId+"/accept",
              type: 'GET',
              dataType: 'json',
              success:function(results){
                worklist.row('.selected').remove().draw( false );
                console.log('accept came back true');
                console.log('results');
                console.log(results);
                // updateReferrals();
              }
            });
          referralsLoaded = true;
          });


          $('#rejectButton').click( function () {
            var rowId = worklist.row('.selected').data()[0]
            $('#acceptButton').prop("disabled",true);
            $('#rejectButton').prop("disabled",true);

            $.ajax({
              url: "https://camhs-api.herokuapp.com/request/"+rowId+"/reject",
              type: 'GET',
              dataType: 'json',
              success:function(results){
                worklist.row('.selected').remove().draw( false );

                console.log('accept came back true');
                console.log('results');
                console.log(results);
              }
            });
          });

          $('#workList').on( 'click', 'tr', function () {
            $('#acceptButton').prop("disabled",false);
            $('#rejectButton').prop("disabled",false);

              if ( $(this).hasClass('selected') ) {
                  $(this).removeClass('selected');
              }
              else {
                  worklist.$('tr.selected').removeClass('selected');
                  $(this).addClass('selected');
              }
          });
        } // end if

      }
    });
  }

  $( "#open-referrals" ).on( "pageshow", function( event ) {
    updateReferrals();
  })







  $('#submit-button').click(function(){
    var formData = $("#create").serialize();
    $.ajax({
      url: "https://camhs-api.herokuapp.com/postrequest?"+formData,
      data: formData,
      type: 'GET',
      dataType: 'json',
      success:function(results){
        alert('Form sent successfully.');
        document.getElementById("create").reset();
      }
    });
  })





});