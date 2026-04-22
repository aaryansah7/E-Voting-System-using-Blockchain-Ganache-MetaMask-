//import "../css/style.css"

const Web3 = require('web3');
const contract = require('@truffle/contract');

const votingArtifacts = require('../../build/contracts/Voting.json');
var VotingContract = contract(votingArtifacts);

window.App = {

account: null,

eventStart: function () {

VotingContract.setProvider(window.ethereum);

// Request account FIRST (critical)
window.ethereum.request({ method: 'eth_requestAccounts' }).then(accounts => {

  App.account = accounts[0];
  $("#accountAddress").html("Your Account: " + App.account);

  VotingContract.defaults({ from: App.account, gas: 6654755 });

  VotingContract.deployed().then(function (instance) {

    // Load candidates
    instance.getCountCandidates().then(function (countCandidates) {

      // Button handlers
      $(document).ready(function () {

        // Add Candidate
        $('#addCandidate').click(function () {
          var nameCandidate = $('#name').val();
          var partyCandidate = $('#party').val();

          instance.addCandidate(nameCandidate, partyCandidate, {
            from: App.account
          }).then(function (result) {
            console.log("Candidate added");
            window.location.reload();
          }).catch(err => console.error(err));
        });

        // Set Dates
        $('#addDate').click(function () {
          var startDate = Date.parse(document.getElementById("startDate").value) / 1000;
          var endDate = Date.parse(document.getElementById("endDate").value) / 1000;

          instance.setDates(startDate, endDate, {
            from: App.account
          }).then(function (rslt) {
            console.log("Dates set");
            window.location.reload();
          }).catch(err => console.error(err));
        });

      });

      // Display Dates
      instance.getDates().then(function (result) {
        var startDate = new Date(result[0] * 1000);
        var endDate = new Date(result[1] * 1000);

        $("#dates").text(startDate.toDateString() + " - " + endDate.toDateString());
      }).catch(function (err) {
        console.error("ERROR! " + err.message);
      });

      // Display Candidates
      for (var i = 0; i < countCandidates; i++) {
        instance.getCandidate(i + 1).then(function (data) {
          var id = data[0];
          var name = data[1];
          var party = data[2];
          var voteCount = data[3];

          var viewCandidates = `<tr>
            <td>
              <input class="form-check-input" type="radio" name="candidate" value="${id}" id=${id}>
              ${name}
            </td>
            <td>${party}</td>
            <td>${voteCount}</td>
          </tr>`;

          $("#boxCandidate").append(viewCandidates);
        });
      }

    });

    // Check voting status
    instance.checkVote().then(function (voted) {
      if (!voted) {
        $("#voteButton").attr("disabled", false);
      }
    });

  });

}).catch(err => {
  console.error("MetaMask error:", err);
});


},

vote: function () {
var candidateID = $("input[name='candidate']:checked").val();


if (!candidateID) {
  $("#msg").html("<p>Please vote for a candidate.</p>");
  return;
}

VotingContract.deployed().then(function (instance) {

  instance.vote(parseInt(candidateID), {
    from: App.account
  }).then(function (result) {
    $("#voteButton").attr("disabled", true);
    $("#msg").html("<p>Voted</p>");
    window.location.reload();
  }).catch(err => console.error(err));

});


}

};

// App initialization
window.addEventListener("load", function () {

if (typeof window.ethereum !== "undefined") {
console.warn("Using MetaMask");
window.web3 = new Web3(window.ethereum);
} else {
console.warn("No web3 detected. Using fallback");
window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
}

window.App.eventStart();
});
