$(document).ready(function () {
  const allCompanies = [
    { name: "Google", image: "assets/Google.png", creator: "Larry Page" },
    { name: "Apple", image: "assets/Apple.png", creator: "Steve Jobs" },
    { name: "Amazon", image: "assets/Amazon.png", creator: "Jeff Bezos" },
    { name: "Microsoft", image: "assets/Microsoft.png", creator: "Bill Gates" },
    { name: "IBM", image: "assets/IBM.png", creator: "Charles Ranlett Flint" },
    { name: "Infosys", image: "assets/Infosys.png", creator: "Narayana Murthy" },
    { name: "Intel", image: "assets/Intel.png", creator: "Robert Noyce" },
    { name: "Cisco", image: "assets/Cisco.png", creator: "Leonard Bosack" },
    { name: "HP", image: "assets/HP.png", creator: "Bill Hewlett" },
    { name: "NVIDIA", image: "assets/NVIDIA.png", creator: "Jensen Huang" },
    { name: "Oracle", image: "assets/Oracle.png", creator: "Larry Ellison" },
    { name: "Facebook", image: "assets/Facebook.png", creator: "Mark Zuckerberg" }
  ];

  let selectedCards = [];
  let matchedPairs = 0;
  let lockBoard = false;
  let coins = 0; // Add coins counter
  let remainingFlips = 20; // Initial number of flips
  let maxFlips = 20; // Maximum number of flips per game
  let flipsUsed = 0; // Track flips used

  // Loader fade out
  setTimeout(() => {
    $("#loader").fadeOut();
    $("#main-content").fadeIn();
  }, 1000);

  $("#startGame").click(function () {
    const selectedCompany = $("#favoriteCompany").val();
    if (!selectedCompany) return alert("Please choose your favorite company!");

    const shuffledCards = shuffleCards(getShuffledCards());
    $("#gameBoard").empty();
    matchedPairs = 0;
    coins = 0; // Reset coins
    remainingFlips = 20;
    $("#flipsRemaining").text(remainingFlips);
    flipsUsed = 0;
    $("#coinCount").text(coins); // Update coin display

    shuffledCards.forEach((company, index) => {
      const card = `
        <div class="col-6 col-sm-4 col-md-3 col-lg-2">
          <div class="flip-card" data-name="${company.name}" data-creator="${company.creator}">
            <div class="flip-card-inner">
              <div class="flip-card-front">
                <img src="assets/card-back.png" alt="card-back">
              </div>
              <div class="flip-card-back">
                <img src="${company.image}" alt="${company.name}">
              </div>
            </div>
          </div>
        </div>`;
      $("#gameBoard").append(card);
    });

    // Add fade-in effect after game board is populated
    $("#gameBoard").addClass('visible');

    // Reset selected cards and lock board state
    selectedCards = [];
    lockBoard = false;
  });

  // Card Click
  $("#gameBoard").on("click", ".flip-card", function () {
    if (lockBoard || $(this).hasClass("matched") || $(this).hasClass("flipped")) return;

    if (remainingFlips <= 0) {
      const restart = confirm("🛑 Out of flips! Click OK to restart game");
      if (restart) {
        $('#startGame').click();
      } else {
        $('#coinShop').click();
      }
      return;
    }

    $(this).addClass("flipped");
    selectedCards.push($(this));

    // Check if this is the favorite company's card
    const favoriteCompany = $("#favoriteCompany").val();
    const companyName = $(this).data("name");
    if (favoriteCompany && favoriteCompany === companyName) {
      $(this).addClass("favorite-card");
    }

    if (selectedCards.length === 2) {
      lockBoard = true;
      const [first, second] = selectedCards;

      const name1 = first.data("name");
      const name2 = second.data("name");

      if (name1 === name2) {
        matchedPairs++;
        // Add sparkle class for continuous animation
        first.addClass("matched");
        second.addClass("matched");
        
        // Show sparkle effect at center of cards
        setTimeout(() => {
          const rect1 = first[0].getBoundingClientRect();
          const rect2 = second[0].getBoundingClientRect();
          showSparkle(rect1.left + rect1.width / 2, rect1.top + rect1.height / 2);
          showSparkle(rect2.left + rect2.width / 2, rect2.top + rect2.height / 2);
          showMCQModal(name1, first.data("creator"), first, second);
          
          // Check for win condition
          if (matchedPairs === 12) {
            setTimeout(() => {
              alert("🎉 You matched all pairs! You win!");
            }, 300);
          }
        }, 600);
        selectedCards = [];
        lockBoard = false;
      } else {
        setTimeout(() => {
          first.removeClass("flipped");
          second.removeClass("flipped");
          selectedCards = [];
          lockBoard = false;
        }, 800);
      }
      remainingFlips--;
      flipsUsed++;
      $("#flipsRemaining").text(remainingFlips);
    }
  });

  // Reveal All cards power-up
  $("#revealAll").click(function () {
    if (coins < 10) {
      alert("❌ You need at least 10 coins!");
      return;
    }

    const unmatched = $(".flip-card").not(".matched").not(".flipped");
    if (unmatched.length === 0) {
      alert("❗ All cards are already revealed or matched.");
      return;
    }

    // Reveal all unmatched cards
    unmatched.addClass("flipped temp-reveal");

    coins -= 10;
    $("#coinCount").text(coins);

    setTimeout(() => {
      $(".temp-reveal").removeClass("flipped temp-reveal");
    }, 4000); // Longer duration for all cards
  });

  // Show sparkle effect at specific coordinates
  function showSparkle(x, y) {
    const sparkle = $('<div class="sparkle"></div>').css({ top: y, left: x });
    $("body").append(sparkle);
    setTimeout(() => sparkle.remove(), 1200);
  }

  // MCQ Modal Logic
  function showMCQModal(companyName, correctCreator, first, second) {
    $("#quizCompanyName").text(companyName);
    const allCreators = allCompanies.map(c => c.creator);
    const options = shuffleArray([correctCreator, ...pickRandomCreators(allCreators, correctCreator, 3)]);

    const formHtml = options
      .map(creator => `
        <div class="form-check">
          <input class="form-check-input" type="radio" name="creator" value="${creator}">
          <label class="form-check-label">${creator}</label>
        </div>
      `)
      .join("");

    $("#mcqForm").html(formHtml);
    const modal = new bootstrap.Modal(document.getElementById("mcqModal"));
    modal.show();

    $("#submitAnswer").off("click").on("click", () => {
      const selected = $("input[name=\"creator\"]:checked").val();
      if (!selected) {
        alert("Please select an answer!");
        return;
      }

      if (selected === correctCreator) {
        alert("✅ Correct!");
        // Only increment matched pairs if answer is correct
        matchedPairs++;
        // Add coin for correct answer
        coins++;
        
        // Check if this was the favorite company's card
        const favoriteCompany = $("#favoriteCompany").val();
        if (favoriteCompany && (first.data("name") === favoriteCompany || second.data("name") === favoriteCompany)) {
          coins++; // Double coins for favorite company
          alert("💰 Bonus coin for matching your favorite company!");
        }
        
        $("#coinCount").text(coins);
        
        // Check if player has won
        if (matchedPairs === 12) {
          setTimeout(() => {
            alert(`🎉 You matched all pairs! You win!\nFlips used: ${flipsUsed}/${maxFlips}`);
          }, 300);
        }
      } else {
        alert(`❌ Wrong! Correct answer is: ${correctCreator}`);
        // Restart the game
        alert("Game Restarting...");
        const selectedCompany = $("#favoriteCompany").val();
        if (selectedCompany) {
          const shuffledCards = shuffleCards(getShuffledCards());
          $("#gameBoard").empty();
          matchedPairs = 0;
          coins = 0;
          remainingFlips = maxFlips;
          flipsUsed = 0;
          $("#coinCount").text(coins);
          $("#flipsRemaining").text(remainingFlips);
          shuffledCards.forEach((company, index) => {
            const card = `
              <div class="col-6 col-sm-4 col-md-3 col-lg-2">
                <div class="flip-card" data-name="${company.name}" data-creator="${company.creator}">
                  <div class="flip-card-inner">
                    <div class="flip-card-front">
                      <img src="assets/card-back.png" alt="card-back">
                    </div>
                    <div class="flip-card-back">
                      <img src="${company.image}" alt="${company.name}">
                    </div>
                  </div>
                </div>
              </div>`;
            $("#gameBoard").append(card);
          });
          $("#gameBoard").addClass('visible');
          selectedCards = [];
          lockBoard = false;
        } else {
          alert("Please choose your favorite company to restart!");
        }
      }

      const modalEl = document.getElementById("mcqModal");
      const instance = bootstrap.Modal.getInstance(modalEl);
      instance.hide();
    });
  }

  // Get all 12 companies and duplicate (24 cards)
  function getShuffledCards() {
    return [...allCompanies, ...allCompanies];
  }

  // Buy flips function
  function buyFlips() {
    if (coins < 3) {
      alert("❌ You need 3 coins!");
      return;
    }
    
    coins -= 3;
    remainingFlips += 5;
    alert("➕ Gained 5 flips!");
  }

  // Coin shop modal handlers
  $("#coinShop").click(function() {
    const modal = new bootstrap.Modal(document.getElementById("coinShopModal"));
    modal.show();
  });

  $("#buyCoins").click(function() {
    const selectedOption = $("#coinOption").val();
    if (!selectedOption) {
      alert("Please select a coin option!");
      return;
    }
    
    coins += parseInt(selectedOption);
    $("#coinCount").text(coins);
    alert(`Purchased ${selectedOption} coins!`);
    
    const modal = bootstrap.Modal.getInstance(document.getElementById("coinShopModal"));
    modal.hide();
  });

  $("#closeCoinShop").click(function() {
    const modal = bootstrap.Modal.getInstance(document.getElementById("coinShopModal"));
    modal.hide();
  });

  // Buy flips button click handler
  $("#buyFlips").click(function() {
    buyFlips();
  });

  // Buy flips modal handlers
  $("#buyFlipsModal").on('show.bs.modal', function() {
    $("#flipsOption").val("");
  });

  $("#confirmBuyFlips").click(function() {
    const modal = bootstrap.Modal.getInstance(document.getElementById("buyFlipsModal"));
    buyFlips();
    modal.hide();
  });

  // Add coin shop modal
  $("#coinShopModal").on('show.bs.modal', function() {
    $("#coinOption").val("");
  });

  // Remove reveal buttons handlers
  $("#revealTwo").remove();
  $("#revealAll").remove();

  // Add Buy Flips modal
  const buyFlipsModalHtml = `
    <div class="modal fade" id="buyFlipsModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">🔄 Buy Flips</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Select Flips Package:</label>
              <select class="form-select" id="flipsOption">
                <option value="5">5 Flips - 2 Coins</option>
                <option value="10">10 Flips - 5 Coins</option>
              </select>
            </div>
            <button type="button" class="btn btn-success w-100" id="confirmBuyFlips">Buy Flips</button>
          </div>
        </div>
      </div>
    </div>
  `;
  $("body").append(buyFlipsModalHtml);

  // Shuffle
  function shuffleArray(arr) {
    return arr.sort(() => Math.random() - 0.5);
  }

  // Shuffle cards and add random IDs
  function shuffleCards(cards) {
    return shuffleArray(cards.map(c => ({ ...c, id: Math.random() })));
  }

  // Pick N random creators excluding the correct one
  function pickRandomCreators(all, exclude, count) {
    const filtered = all.filter(name => name !== exclude);
    return shuffleArray(filtered).slice(0, count);
  }
});
