// External dependencies
const express = require('express');

const router = express.Router();

// Add your routes here - above the module.exports line

module.exports = router;

router.post('/prototype_v1/relatives-with-cancer-answer', function(request, response) {
var relativesHaveCancer = request.session.data['relativesHaveCancer']
var smokedRegularly = request.session.data['smokedRegularly']

if (relativesHaveCancer == "Yes"){
  // If relatives had cancer, ask about their age first
  response.redirect("/prototype_v1/relatives-age-when-diagnosed")
} else if (relativesHaveCancer == "No"){
  // No relatives with cancer, route based on smoking status
 if (smokedRegularly == "Yes-currently") {
  response.redirect("/prototype_v1/how-old-when-started-smoking")
} else if (smokedRegularly == "Yes-usedToRegularly") {
  response.redirect("/prototype_v1/how-old-when-started-smoking")
  } else {
    // Fallback to original logic if smoking status unclear
    response.redirect("/prototype_v1/do-you-smoke-now")
  }
} else {
  response.redirect("/prototype_v1/relatives-with-cancer")
}
})


router.post('/prototype_v1/relatives-age-answer', function(request, response) {
var smokedRegularly = request.session.data['smokedRegularly']

if (smokedRegularly == "Yes-currently") {
  response.redirect("/prototype_v1/how-old-when-started-smoking")
} else if (smokedRegularly == "Yes-usedToRegularly") {
  response.redirect("/prototype_v1/how-old-when-started-smoking")
} else {
  // Fallback
  response.redirect("/prototype_v1/do-you-smoke-now")
}
})

router.get('/prototype_v1/start-journey', function (request, response) {
    delete request.session.data
    response.redirect("/prototype_v1/eligibility-have-you-ever-smoked")
})

router.post('/prototype_v1/smokedRegularlyAnswer', function(request, response) {
    var smokedRegularly = request.session.data['smokedRegularly']
    if (smokedRegularly == "Yes-currently"){
        response.redirect("/prototype_v1/eligibility-what-is-your-date-of-birth")
    } else if (smokedRegularly == "Yes-usedToRegularly"){
        response.redirect("/prototype_v1/eligibility-what-is-your-date-of-birth")
    } else if (smokedRegularly == "Yes-usedToFewTimes"){
        response.redirect("/prototype_v1/drop-out-never-smoked") 
    } else if (smokedRegularly == "No"){
        response.redirect("/prototype_v1/drop-out-never-smoked")
    }
    else {
        response.redirect("/prototype_v1/eligibility-have-you-ever-smoked")
    }
})

router.post('/prototype_v1/smokeNowAnswer', function(request, response) {
    var smokeNow = request.session.data['smokeNow']
    if (smokeNow == "Yes"){
        response.redirect("/prototype_v1/current-smoker-how-many-years")
    } else if (smokeNow == "No"){
        response.redirect("/prototype_v1/former-smoker-when-quit-smoking")
    } else {
        response.redirect("/prototype_v1/do-you-smoke-now")
    }
})

router.post('/prototype_v1/who-should-not-use-answer', function(request, response) {
    var smokeNow = request.session.data['canYouContinue']
    if (smokeNow == "Yes"){
        response.redirect("/prototype_v1/what-is-your-height")
    } else if (smokeNow == "No"){
        response.redirect("/prototype_v1/drop-out-bmi")
    } else {
        response.redirect("/prototype_v1/who-should-not-use-this-online-service")
    }
})

router.post('/prototype_v1/whatDoYouSmokeAnswer', function(request, response) {
  var selectedTobacco = request.session.data['whatSmokeNow'];
  
  // Ensure it's an array (single selection becomes array)
  if (!Array.isArray(selectedTobacco)) {
    selectedTobacco = selectedTobacco ? [selectedTobacco] : [];
  }
  
  // Define page mapping in order (matches checkbox order)
  const tobaccoPages = [
    { value: 'Cigarettes', page: 'tobacco-how-many-cigarettes-per-day' },
    { value: 'Rolled cigarettes', page: 'tobacco-rolled-cigarettes-how-many-grams' },
    { value: 'Pipe', page: 'tobacco-pipe-how-many-bowls' },
    { value: 'Cigars', page: 'tobacco-what-size-cigars-do-you-smoke' },
    { value: 'Hookah', page: 'tobacco-hookah-and-shisha' }
  ];
  
  // Create queue of pages to visit
  var pagesToVisit = [];
  tobaccoPages.forEach(function(tobacco) {
    if (selectedTobacco.includes(tobacco.value)) {
      pagesToVisit.push(tobacco.page);
    }
  });
  
  // Store the queue in session
  request.session.data['tobaccoPageQueue'] = pagesToVisit;
  request.session.data['currentTobaccoPageIndex'] = 0;
  
  // Redirect to first page or check answers if no pages
  if (pagesToVisit.length > 0) {
    response.redirect('/prototype_v1/' + pagesToVisit[0]);
  } else {
    response.redirect('/prototype_v1/check-your-answers');
  }
})

router.post('/prototype_v1/dateOfBirthAnswer', function(request, response) {
  const day = request.session.data['dateOfBirth']['day']
  const month = request.session.data['dateOfBirth']['month'] 
  const year = request.session.data['dateOfBirth']['year']
  
  // Check if all fields are provided
  if (!day || !month || !year) {
    return response.redirect("/prototype_v1/eligibility-what-is-your-date-of-birth")
  }
  
  // Calculate age
  const birthDate = new Date(year, month - 1, day) // month is 0-indexed
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  // Check age eligibility (55-74 for lung health checks)
  if (age < 55 || age > 74) {
    return response.redirect("/prototype_v1/drop-out-age")
  }
  
  // If eligible, show the smoking question page
  response.render('prototype_v1/task-list')
})

router.post('/prototype_v1/whatDidYouSmokeAnswer', function(request, response) {
  var selectedTobacco = request.session.data['whatDidSmoke'];
  
  // Ensure it's an array (single selection becomes array)
  if (!Array.isArray(selectedTobacco)) {
    selectedTobacco = selectedTobacco ? [selectedTobacco] : [];
  }
  
  // Define page mapping for former smokers (same pages, different route name)
  const tobaccoPages = [
    { value: 'Cigarettes', page: 'tobacco-how-many-cigarettes-per-day' },
    { value: 'Rolled cigarettes', page: 'tobacco-rolled-cigarettes-how-many-grams' },
    { value: 'Pipe', page: 'tobacco-pipe-how-many-bowls' },
    { value: 'Cigars', page: 'tobacco-what-size-cigars-do-you-smoke' },
    { value: 'Hookah', page: 'tobacco-hookah-and-shisha' }
  ];
  
  // Create queue of pages to visit
  var pagesToVisit = [];
  tobaccoPages.forEach(function(tobacco) {
    if (selectedTobacco.includes(tobacco.value)) {
      pagesToVisit.push(tobacco.page);
    }
  });
  
  // Store the queue in session
  request.session.data['tobaccoPageQueue'] = pagesToVisit;
  request.session.data['currentTobaccoPageIndex'] = 0;
  
  // Redirect to first page or check answers if no pages
  if (pagesToVisit.length > 0) {
    response.redirect('/prototype_v1/' + pagesToVisit[0]);
  } else {
    response.redirect('/prototype_v1/check-your-answers');
  }
})

router.post('/prototype_v1/tobacco-next', function(request, response) {
  var queue = request.session.data['tobaccoPageQueue'] || [];
  var currentIndex = request.session.data['currentTobaccoPageIndex'] || 0;
  
  // Move to next page
  currentIndex++;
  request.session.data['currentTobaccoPageIndex'] = currentIndex;
  
  // Check if more pages in queue
  if (currentIndex < queue.length) {
    response.redirect('/prototype_v1/' + queue[currentIndex]);
  } else {
    // All tobacco pages completed, go to check answers
    response.redirect('/prototype_v1/check-your-answers');
  }
})
router.post('/prototype_v1/ageStartedSmokingAnswer', function(request, response) {
  var smokedRegularly = request.session.data['smokedRegularly']
  
  if (smokedRegularly == "Yes-currently") {
    response.redirect("/prototype_v1/have-you-ever-stopped-smoking")
  } else if (smokedRegularly == "Yes-usedToRegularly") {
    response.redirect("/prototype_v1/former-smoker-when-quit-smoking")
  } else {
    // Fallback
    response.redirect("/prototype_v1/how-old-when-started-smoking")
  }
})


router.post('/prototype_v1/tobaccoHookahSessionAnswer', function(request, response) {
  var hookahSession = request.session.data['hookahSession']
  
  // If hookahSession is a string (single selection), convert to array
  if (typeof hookahSession === 'string') {
    hookahSession = [hookahSession]
  }
  
  // Check what was selected and route accordingly
  if (hookahSession && hookahSession.includes('In a group session') && hookahSession.includes('By myself')) {
    // Both selected - go to group first, then individual
    response.redirect("/prototype_v1/tobacco-hookah-how-much-group")
  } else if (hookahSession && hookahSession.includes('In a group session')) {
    // Only group selected
    response.redirect("/prototype_v1/tobacco-hookah-how-much-group")
  } else if (hookahSession && hookahSession.includes('By myself')) {
    // Only individual selected
    response.redirect("/prototype_v1/tobacco-how-much-by-yourself")
  } else {
    // Nothing selected or error - continue to next tobacco type
    response.redirect("/prototype_v1/tobacco-next")
  }
})


router.post('/prototype_v1/tobaccoHookahGroupToIndividual', function(request, response) {
  var hookahSession = request.session.data['hookahSession']
  
  // Convert to array if needed
  if (typeof hookahSession === 'string') {
    hookahSession = [hookahSession]
  }
  
  // If both were selected and user just completed group, go to individual
  if (hookahSession && hookahSession.includes('By myself')) {
    response.redirect("/prototype_v1/tobacco-how-much-by-yourself")
  } else {
    // Otherwise continue to next tobacco type
    response.redirect("/prototype_v1/tobacco-next")
  }
})

/////////////////
// Prototype 2 //
/////////////////
/////////////////
/////////////////


router.post('/prototype_v2/relatives-with-cancer-answer', function(request, response) {
var relativesHaveCancer = request.session.data['relativesHaveCancer']

if (relativesHaveCancer == "Yes"){
  // If relatives had cancer, ask about their age first
  response.redirect("/prototype_v2/relatives-age-when-diagnosed")
} else if (relativesHaveCancer == "No" || relativesHaveCancer == "I don't know"){
  // No relatives with cancer OR don't know, go straight to age started smoking
  response.redirect("/prototype_v2/how-old-when-started-smoking")
} else {
  // No answer provided, redirect back to the question
  response.redirect("/prototype_v2/relatives-with-cancer")
}
})

router.post('/prototype_v2/relatives-age-answer', function(request, response) {
  response.redirect("/prototype_v2/how-old-when-started-smoking")
})

router.get('/prototype_v2/start-journey', function (request, response) {
    delete request.session.data
    response.redirect("/prototype_v2/have-you-completed-by-phone")
})

router.post('/prototype_v2/have-you-completed-by-phone-answer', function(request, response) {
  const completedByPhone = request.session.data['completedByPhone']
  
  if (completedByPhone === 'Yes') {
    // If they've already completed by phone, redirect to exit page
    response.redirect('/prototype_v2/completed-by-phone-exit')
  } else if (completedByPhone === 'No') {
    // If they haven't completed by phone, continue to eligibility
    response.redirect('/prototype_v2/eligibility-have-you-ever-smoked')
  } else {
    // If no answer provided, redirect back to the question
    response.redirect('/prototype_v2/have-you-completed-by-phone')
  }
})

router.post('/prototype_v2/smokedRegularlyAnswer', function(request, response) {
    var smokedRegularly = request.session.data['smokedRegularly']
    if (smokedRegularly == "Yes-currently"){
        response.redirect("/prototype_v2/eligibility-what-is-your-date-of-birth")
    } else if (smokedRegularly == "Yes-usedToRegularly"){
        response.redirect("/prototype_v2/eligibility-what-is-your-date-of-birth")
    } else if (smokedRegularly == "Yes-usedToFewTimes"){
        response.redirect("/prototype_v2/drop-out-never-smoked") 
    } else if (smokedRegularly == "No"){
        response.redirect("/prototype_v2/drop-out-never-smoked")
    }
    else {
        response.redirect("/prototype_v2/eligibility-have-you-ever-smoked")
    }
})

router.post('/prototype_v2/smokeNowAnswer', function(request, response) {
    var smokeNow = request.session.data['smokeNow']
    if (smokeNow == "Yes"){
        response.redirect("/prototype_v2/current-smoker-how-many-years")
    } else if (smokeNow == "No"){
        response.redirect("/prototype_v2/former-smoker-when-quit-smoking")
    } else {
        response.redirect("/prototype_v2/do-you-smoke-now")
    }
})

router.post('/prototype_v2/who-should-not-use-answer', function(request, response) {
    var smokeNow = request.session.data['canYouContinue']
    if (smokeNow == "Yes"){
        response.redirect("/prototype_v2/drop-out-bmi")
    } else if (smokeNow == "No"){
        response.redirect("/prototype_v2/what-is-your-height")
    } else {
        response.redirect("/prototype_v2/who-should-not-use-this-online-service")
    }
})

router.post('/prototype_v2/whatDoYouSmokeAnswer', function(request, response) {
  var selectedTobacco = request.session.data['whatSmokeNow'];
  
  // Ensure it's an array (single selection becomes array)
  if (!Array.isArray(selectedTobacco)) {
    selectedTobacco = selectedTobacco ? [selectedTobacco] : [];
  }
  
  // Define page mapping in order (matches checkbox order)
  const tobaccoPages = [
    { value: 'Cigarettes', page: 'tobacco-how-many-cigarettes-per-day' },
    { value: 'Rolled cigarettes', page: 'tobacco-rolled-cigarettes-how-many-grams' },
    { value: 'Pipe', page: 'tobacco-pipe-how-many-bowls' },
    { value: 'Cigars', page: 'tobacco-what-size-cigars-do-you-smoke' },
    { value: 'Hookah', page: 'tobacco-hookah-and-shisha' }
  ];
  
  // Create queue of pages to visit
  var pagesToVisit = [];
  tobaccoPages.forEach(function(tobacco) {
    if (selectedTobacco.includes(tobacco.value)) {
      pagesToVisit.push(tobacco.page);
    }
  });
  
  // Store the queue in session
  request.session.data['tobaccoPageQueue'] = pagesToVisit;
  request.session.data['currentTobaccoPageIndex'] = 0;
  
  // Redirect to first page or check answers if no pages
  if (pagesToVisit.length > 0) {
    response.redirect('/prototype_v2/' + pagesToVisit[0]);
  } else {
    response.redirect('/prototype_v2/check-your-answers');
  }
})

router.post('/prototype_v2/dateOfBirthAnswer', function(request, response) {
  const day = request.session.data['dateOfBirth']['day']
  const month = request.session.data['dateOfBirth']['month'] 
  const year = request.session.data['dateOfBirth']['year']
  
  // Check if all fields are provided
  if (!day || !month || !year) {
    return response.redirect("/prototype_v2/eligibility-what-is-your-date-of-birth")
  }
  
  // Calculate age
  const birthDate = new Date(year, month - 1, day) // month is 0-indexed
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  // Check age eligibility (55-74 for lung health checks)
  if (age < 55 || age > 74) {
    return response.redirect("/prototype_v2/drop-out-age")
  }
  
  // If eligible, show the smoking question page
  response.render('prototype_v2/check-if-you-need-face-to-face-appointment')
})

router.post('/prototype_v2/whatDidYouSmokeAnswer', function(request, response) {
  var selectedTobacco = request.session.data['whatDidSmoke'];
  
  // Ensure it's an array (single selection becomes array)
  if (!Array.isArray(selectedTobacco)) {
    selectedTobacco = selectedTobacco ? [selectedTobacco] : [];
  }
  
  // Define page mapping for former smokers (same pages, different route name)
  const tobaccoPages = [
    { value: 'Cigarettes', page: 'tobacco-how-many-cigarettes-per-day' },
    { value: 'Rolled cigarettes', page: 'tobacco-rolled-cigarettes-how-many-grams' },
    { value: 'Pipe', page: 'tobacco-pipe-how-many-bowls' },
    { value: 'Cigars', page: 'tobacco-what-size-cigars-do-you-smoke' },
    { value: 'Hookah', page: 'tobacco-hookah-and-shisha' }
  ];
  
  // Create queue of pages to visit
  var pagesToVisit = [];
  tobaccoPages.forEach(function(tobacco) {
    if (selectedTobacco.includes(tobacco.value)) {
      pagesToVisit.push(tobacco.page);
    }
  });
  
  // Store the queue in session
  request.session.data['tobaccoPageQueue'] = pagesToVisit;
  request.session.data['currentTobaccoPageIndex'] = 0;
  
  // Redirect to first page or check answers if no pages
  if (pagesToVisit.length > 0) {
    response.redirect('/prototype_v2/' + pagesToVisit[0]);
  } else {
    response.redirect('/prototype_v2/check-your-answers');
  }
})

router.post('/prototype_v2/tobacco-next', function(request, response) {
  var queue = request.session.data['tobaccoPageQueue'] || [];
  var currentIndex = request.session.data['currentTobaccoPageIndex'] || 0;
  
  // Move to next page
  currentIndex++;
  request.session.data['currentTobaccoPageIndex'] = currentIndex;
  
  // Check if more pages in queue
  if (currentIndex < queue.length) {
    response.redirect('/prototype_v2/' + queue[currentIndex]);
  } else {
    // All tobacco pages completed, go to check answers
    response.redirect('/prototype_v2/check-your-answers');
  }
})

router.post('/prototype_v2/ageStartedSmokingAnswer', function(request, response) {
  var smokedRegularly = request.session.data['smokedRegularly']
  
  if (smokedRegularly == "Yes-currently") {
    response.redirect("/prototype_v2/have-you-ever-stopped-smoking")
  } else if (smokedRegularly == "Yes-usedToRegularly") {
    response.redirect("/prototype_v2/former-smoker-when-quit-smoking")
  } else {
    // Fallback
    response.redirect("/prototype_v2/how-old-when-started-smoking")
  }
})

router.post('/prototype_v2/tobaccoHookahSessionAnswer', function(request, response) {
  var hookahSession = request.session.data['hookahSession']
  
  // If hookahSession is a string (single selection), convert to array
  if (typeof hookahSession === 'string') {
    hookahSession = [hookahSession]
  }
  
  // Check what was selected and route accordingly
  if (hookahSession && hookahSession.includes('In a group session') && hookahSession.includes('By myself')) {
    // Both selected - go to group first, then individual
    response.redirect("/prototype_v2/tobacco-hookah-how-much-group")
  } else if (hookahSession && hookahSession.includes('In a group session')) {
    // Only group selected
    response.redirect("/prototype_v2/tobacco-hookah-how-much-group")
  } else if (hookahSession && hookahSession.includes('By myself')) {
    // Only individual selected
    response.redirect("/prototype_v2/tobacco-how-much-by-yourself")
  } else {
    // Nothing selected or error - continue to next tobacco type
    response.redirect("/prototype_v2/tobacco-next")
  }
})

router.post('/prototype_v2/tobaccoHookahGroupToIndividual', function(request, response) {
  var hookahSession = request.session.data['hookahSession']
  
  // Convert to array if needed
  if (typeof hookahSession === 'string') {
    hookahSession = [hookahSession]
  }
  
  // If both were selected and user just completed group, go to individual
  if (hookahSession && hookahSession.includes('By myself')) {
    response.redirect("/prototype_v2/tobacco-how-much-by-yourself")
  } else {
    // Otherwise continue to next tobacco type
    response.redirect("/prototype_v2/tobacco-next")
  }
})

/////////////////
// Prototype 3 //
/////////////////

// ============================================
// START AND LOGIN FLOW
// ============================================

router.get('/prototype_v3/start-journey', function (request, response) {
  delete request.session.data
  response.redirect("/prototype_v3/login")
})

router.post('/prototype_v3/login', function (request, response) {
  response.redirect('/prototype_v3/accept-terms')
})

// Show accept terms page (GET request clears any error state)
router.get('/prototype_v3/accept-terms', function (request, response) {
  // Clear any previous error state
  delete request.session.data['accept-terms-error']
  response.render('prototype_v3/accept-terms')
})

// Accept terms validation (POST)
router.post('/prototype_v3/accept-terms', function (request, response) {
  const acceptTerms = request.session.data['accept-terms']
  
  // Check if acceptTerms is an array containing 'yes' or if it's the string 'yes'
  const isAccepted = (Array.isArray(acceptTerms) && acceptTerms.includes('yes')) || acceptTerms === 'yes'
  
  if (!isAccepted) {
    // Checkbox not ticked - show error
    request.session.data['accept-terms-error'] = true
    response.redirect('/prototype_v3/accept-terms')
  } else {
    // Checkbox ticked - clear error and continue to next page
    delete request.session.data['accept-terms-error']
    response.redirect('/prototype_v3/have-you-completed-by-phone')
  }
})

// ============================================
// INITIAL ELIGIBILITY CHECKS
// ============================================

router.post('/prototype_v3/have-you-completed-by-phone-answer', function(request, response) {
  const completedByPhone = request.session.data['completedByPhone']
  
  if (completedByPhone === 'Yes') {
    response.redirect('/prototype_v3/completed-by-phone-exit')
  } else if (completedByPhone === 'No') {
    response.redirect('/prototype_v3/eligibility-have-you-ever-smoked')
  } else {
    response.redirect('/prototype_v3/have-you-completed-by-phone')
  }
})

router.post('/prototype_v3/smokedRegularlyAnswer', function(request, response) {
  var smokedRegularly = request.session.data['smokedRegularly']
  
  if (smokedRegularly == "Yes-currently"){
    response.redirect("/prototype_v3/eligibility-what-is-your-date-of-birth")
  } else if (smokedRegularly == "Yes-usedToRegularly"){
    response.redirect("/prototype_v3/eligibility-what-is-your-date-of-birth")
  } else if (smokedRegularly == "Yes-usedToFewTimes"){
    response.redirect("/prototype_v3/drop-out-never-smoked") 
  } else if (smokedRegularly == "No"){
    response.redirect("/prototype_v3/drop-out-never-smoked")
  } else {
    response.redirect("/prototype_v3/eligibility-have-you-ever-smoked")
  }
})

router.post('/prototype_v3/dateOfBirthAnswer', function(request, response) {
  const day = request.session.data['dateOfBirth']['day']
  const month = request.session.data['dateOfBirth']['month'] 
  const year = request.session.data['dateOfBirth']['year']
  
  if (!day || !month || !year) {
    return response.redirect("/prototype_v3/eligibility-what-is-your-date-of-birth")
  }
  
  const birthDate = new Date(year, month - 1, day)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  if (age < 55 || age > 74) {
    return response.redirect("/prototype_v3/drop-out-age")
  }
  
  response.render('prototype_v3/check-if-you-need-face-to-face-appointment')
})

router.post('/prototype_v3/who-should-not-use-answer', function(request, response) {
  var canContinue = request.session.data['canYouContinue']
  
  if (canContinue == "Yes"){
    response.redirect("/prototype_v3/drop-out-bmi")
  } else if (canContinue == "No"){
    response.redirect("/prototype_v3/what-is-your-height")
  } else {
    response.redirect("/prototype_v3/who-should-not-use-this-online-service")
  }
})

// ============================================
// MEDICAL HISTORY
// ============================================
router.post('/prototype_v3/diagnosed-with-cancer-answer', function(request, response) {
  response.redirect("/prototype_v3/relatives-with-cancer")
})

router.post('/prototype_v3/relatives-with-cancer-answer', function(request, response) {
  var relativesHaveCancer = request.session.data['relativesHaveCancer']

  if (relativesHaveCancer == "Yes"){
    response.redirect("/prototype_v3/relatives-age-when-diagnosed")
  } else if (relativesHaveCancer == "No" || relativesHaveCancer == "I don't know"){
    response.redirect("/prototype_v3/how-old-when-started-smoking")
  } else {
    response.redirect("/prototype_v3/relatives-with-cancer")
  }
})

router.post('/prototype_v3/relatives-age-answer', function(request, response) {
  response.redirect("/prototype_v3/how-old-when-started-smoking")
})



// ============================================
// ROUTING FOR PERIODS WHEN YOU STOPPED SMOKING
// ============================================

// Route handler for "How old when started smoking" page
// This sends current smokers to "periods when stopped" and former smokers to "when quit"
router.post('/prototype_v3/how-old-when-started-smoking-answer', function(request, response) {
  var smokedRegularly = request.session.data['smokedRegularly']
  
  if (smokedRegularly == "Yes-currently") {
    response.redirect("/prototype_v3/periods-when-you-stopped-smoking")
  } else if (smokedRegularly == "Yes-usedToRegularly") {
    response.redirect("/prototype_v3/former-smoker-when-quit-smoking")
  } else {
    // Fallback
    response.redirect("/prototype_v3/how-old-when-started-smoking")
  }
})

// Route handler for "Former smoker when quit" page
// This sends former smokers to "periods when stopped"
router.post('/prototype_v3/former-smoker-when-quit-smoking-answer', function(request, response) {
  response.redirect("/prototype_v3/periods-when-you-stopped-smoking")
})

// Route handler for "Periods when you stopped smoking" page
// This sends everyone to the tobacco selection page
router.post('/prototype_v3/periods-when-you-stopped-smoking-answer', function(request, response) {
  response.redirect("/prototype_v3/what-do-or-did-smoke")
})


// ============================================
// HELPER FUNCTIONS
// ============================================

function moveToNextTobaccoType(request, response) {
  var tobaccoQueue = request.session.data['tobaccoQueue'] || []
  var currentIndex = request.session.data['tobaccoQueueIndex'] || 0
  
  currentIndex++
  request.session.data['tobaccoQueueIndex'] = currentIndex
  
  if (currentIndex < tobaccoQueue.length) {
    response.redirect(tobaccoQueue[currentIndex])
  } else {
    response.redirect('/prototype_v3/check-your-answers')
  }
}

// ============================================
// TOBACCO TYPE SELECTION - UPDATED FOR SINGLE LIST
// ============================================

router.post('/prototype_v3/what-do-or-did-smoke-answer', function(request, response) {
  var selectedTobacco = request.session.data['tobaccoTypes']
  var smokedRegularly = request.session.data['smokedRegularly']
  
  // Ensure it's an array
  if (!Array.isArray(selectedTobacco)) {
    selectedTobacco = selectedTobacco ? [selectedTobacco] : []
  }
  
  const tobaccoRoutes = {
    'Cigarettes': '/prototype_v3/tobacco/cigarettes',
    'Rolled cigarettes': '/prototype_v3/tobacco/rolled-cigarettes',
    'Pipe': '/prototype_v3/tobacco/pipe',
    'Cigars': '/prototype_v3/tobacco/cigars',
    'Cigarillos': '/prototype_v3/tobacco/cigarillos',
    'Shisha': '/prototype_v3/tobacco/shisha'
  }
  
  var tobaccoQueue = []
  var tobaccoOrder = ['Cigarettes', 'Rolled cigarettes', 'Pipe', 'Cigars', 'Cigarillos', 'Shisha']
  
  // Check if user selected multiple tobacco types
  var multipleTypes = selectedTobacco.length > 1
  
  // For CURRENT smokers with MULTIPLE types, add "do you currently smoke X" pages
  // For CURRENT smokers with ONE type, go straight to current pages (we already know they currently smoke)
  // For FORMER smokers, skip directly to former tobacco pages
  tobaccoOrder.forEach(function(type) {
    if (selectedTobacco.includes(type)) {
      if (smokedRegularly === "Yes-currently") {
        if (multipleTypes) {
          // Multiple types - need to ask which ones they currently smoke
          tobaccoQueue.push(tobaccoRoutes[type] + '/do-you-currently-smoke')
        } else {
          // Single type and they're a current smoker - go straight to current pages
          tobaccoQueue.push(tobaccoRoutes[type] + '/current/years-smoked')
        }
      } else if (smokedRegularly === "Yes-usedToRegularly") {
        // Former smoker - go straight to former pages
        tobaccoQueue.push(tobaccoRoutes[type] + '/former/years-smoked')
      }
    }
  })
  
  request.session.data['tobaccoQueue'] = tobaccoQueue
  request.session.data['tobaccoQueueIndex'] = 0
  
  if (tobaccoQueue.length > 0) {
    response.redirect(tobaccoQueue[0])
  } else {
    response.redirect('/prototype_v3/check-your-answers')
  }
})

// ============================================
// "DO YOU CURRENTLY SMOKE" ROUTING - CIGARETTES
// ============================================

router.post('/prototype_v3/tobacco/cigarettes/do-you-currently-smoke-answer', function(request, response) {
  var currentlySmokesCigarettes = request.session.data['currentlySmokesCigarettes']
  
  if (currentlySmokesCigarettes === 'Yes') {
    response.redirect('/prototype_v3/tobacco/cigarettes/current/quantity-daily')
  } else {
    response.redirect('/prototype_v3/tobacco/cigarettes/former/quantity-daily')
  }
})

// ============================================
// CIGARETTES ROUTING - CURRENT
// ============================================

router.post('/prototype_v3/tobacco/cigarettes/current/quantity-daily-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarettes/current/has-quantity-changed')
})

router.post('/prototype_v3/tobacco/cigarettes/current/has-quantity-changed-answer', function(request, response) {
  var changes = request.session.data['cigarettesCurrentChanges']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('more')) {
    response.redirect('/prototype_v3/tobacco/cigarettes/current/more-frequency')
  } else if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/cigarettes/current/less-frequency')
  } else if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/cigarettes/current/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// MORE flow
router.post('/prototype_v3/tobacco/cigarettes/current/more-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarettes/current/more-quantity')
})

router.post('/prototype_v3/tobacco/cigarettes/current/more-quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarettes/current/more-duration')
})

router.post('/prototype_v3/tobacco/cigarettes/current/more-duration-answer', function(request, response) {
  var changes = request.session.data['cigarettesCurrentChanges']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  // Check if they also selected 'less'
  if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/cigarettes/current/less-frequency')
  } else if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/cigarettes/current/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// LESS flow
router.post('/prototype_v3/tobacco/cigarettes/current/less-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarettes/current/less-quantity')
})

router.post('/prototype_v3/tobacco/cigarettes/current/less-quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarettes/current/less-duration')
})

router.post('/prototype_v3/tobacco/cigarettes/current/less-duration-answer', function(request, response) {
  var changes = request.session.data['cigarettesCurrentChanges']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  // Check if they also selected 'stopped'
  if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/cigarettes/current/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

router.post('/prototype_v3/tobacco/cigarettes/current/stopped-years-answer', function(request, response) {
  moveToNextTobaccoType(request, response)
})

// ============================================
// CIGARETTES ROUTING - FORMER
// ============================================

router.post('/prototype_v3/tobacco/cigarettes/former/quantity-daily-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarettes/former/has-quantity-changed')
})

router.post('/prototype_v3/tobacco/cigarettes/former/has-quantity-changed-answer', function(request, response) {
  var changes = request.session.data['cigarettesFormerChanges']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('more')) {
    response.redirect('/prototype_v3/tobacco/cigarettes/former/more-frequency')
  } else if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/cigarettes/former/less-frequency')
  } else if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/cigarettes/former/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// MORE flow - FORMER
router.post('/prototype_v3/tobacco/cigarettes/former/more-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarettes/former/more-quantity')
})

router.post('/prototype_v3/tobacco/cigarettes/former/more-quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarettes/former/more-duration')
})

router.post('/prototype_v3/tobacco/cigarettes/former/more-duration-answer', function(request, response) {
  var changes = request.session.data['cigarettesFormerChanges']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/cigarettes/former/less-frequency')
  } else if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/cigarettes/former/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// LESS flow - FORMER
router.post('/prototype_v3/tobacco/cigarettes/former/less-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarettes/former/less-quantity')
})

router.post('/prototype_v3/tobacco/cigarettes/former/less-quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarettes/former/less-duration')
})

router.post('/prototype_v3/tobacco/cigarettes/former/less-duration-answer', function(request, response) {
  var changes = request.session.data['cigarettesFormerChanges']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/cigarettes/former/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

router.post('/prototype_v3/tobacco/cigarettes/former/stopped-years-answer', function(request, response) {
  moveToNextTobaccoType(request, response)
})

// ============================================
// "DO YOU CURRENTLY SMOKE" ROUTING - ROLLED CIGARETTES
// ============================================

router.post('/prototype_v3/tobacco/rolled-cigarettes/do-you-currently-smoke-answer', function(request, response) {
  var currentlySmokesRolledCigarettes = request.session.data['currentlySmokesRolledCigarettes']
  
  if (currentlySmokesRolledCigarettes === 'Yes') {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/current/quantity-daily')
  } else {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/former/quantity-daily')
  }
})

// ============================================
// ROLLED CIGARETTES ROUTING - CURRENT
// ============================================

router.post('/prototype_v3/tobacco/rolled-cigarettes/current/quantity-daily-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/rolled-cigarettes/current/has-quantity-changed')
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/current/has-quantity-changed-answer', function(request, response) {
  var changes = request.session.data['rolledCigarettesCurrentChanges']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('more')) {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/current/more-frequency')
  } else if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/current/less-frequency')
  } else if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/current/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// MORE flow
router.post('/prototype_v3/tobacco/rolled-cigarettes/current/more-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/rolled-cigarettes/current/more-quantity')
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/current/more-quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/rolled-cigarettes/current/more-duration')
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/current/more-duration-answer', function(request, response) {
  var changes = request.session.data['rolledCigarettesCurrentChanges']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  // Check if they also selected 'less'
  if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/current/less-frequency')
  } else if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/current/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// LESS flow
router.post('/prototype_v3/tobacco/rolled-cigarettes/current/less-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/rolled-cigarettes/current/less-quantity')
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/current/less-quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/rolled-cigarettes/current/less-duration')
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/current/less-duration-answer', function(request, response) {
  var changes = request.session.data['rolledCigarettesCurrentChanges']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  // Check if they also selected 'stopped'
  if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/current/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/current/stopped-years-answer', function(request, response) {
  moveToNextTobaccoType(request, response)
})

// ============================================
// ROLLED CIGARETTES ROUTING - FORMER
// ============================================

router.post('/prototype_v3/tobacco/rolled-cigarettes/former/quantity-daily-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/rolled-cigarettes/former/has-quantity-changed')
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/former/has-quantity-changed-answer', function(request, response) {
  var changes = request.session.data['rolledCigarettesFormerChanges']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('more')) {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/former/more-frequency')
  } else if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/former/less-frequency')
  } else if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/former/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// MORE flow - FORMER
router.post('/prototype_v3/tobacco/rolled-cigarettes/former/more-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/rolled-cigarettes/former/more-quantity')
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/former/more-quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/rolled-cigarettes/former/more-duration')
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/former/more-duration-answer', function(request, response) {
  var changes = request.session.data['rolledCigarettesFormerChanges']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/former/less-frequency')
  } else if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/former/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// LESS flow - FORMER
router.post('/prototype_v3/tobacco/rolled-cigarettes/former/less-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/rolled-cigarettes/former/less-quantity')
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/former/less-quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/rolled-cigarettes/former/less-duration')
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/former/less-duration-answer', function(request, response) {
  var changes = request.session.data['rolledCigarettesFormerChanges']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/former/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/former/stopped-years-answer', function(request, response) {
  moveToNextTobaccoType(request, response)
})

// ============================================
// "DO YOU CURRENTLY SMOKE" ROUTING - PIPE
// ============================================

router.post('/prototype_v3/tobacco/pipe/do-you-currently-smoke-answer', function(request, response) {
  var currentlySmokesPipe = request.session.data['currentlySmokesPipe']
  
  if (currentlySmokesPipe === 'Yes') {
    response.redirect('/prototype_v3/tobacco/pipe/current/quantity-daily')
  } else {
    response.redirect('/prototype_v3/tobacco/pipe/former/quantity-daily')
  }
})

// ============================================
// PIPE ROUTING - CURRENT
// ============================================

router.post('/prototype_v3/tobacco/pipe/current/quantity-daily-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/pipe/current/has-quantity-changed')
})

router.post('/prototype_v3/tobacco/pipe/current/has-quantity-changed-answer', function(request, response) {
  var changes = request.session.data['pipeCurrentChanges']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('more')) {
    response.redirect('/prototype_v3/tobacco/pipe/current/more-frequency')
  } else if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/pipe/current/less-frequency')
  } else if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/pipe/current/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// MORE flow
router.post('/prototype_v3/tobacco/pipe/current/more-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/pipe/current/more-quantity')
})

router.post('/prototype_v3/tobacco/pipe/current/more-quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/pipe/current/more-duration')
})

router.post('/prototype_v3/tobacco/pipe/current/more-duration-answer', function(request, response) {
  var changes = request.session.data['pipeCurrentChanges']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  // Check if they also selected 'less'
  if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/pipe/current/less-frequency')
  } else if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/pipe/current/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// LESS flow
router.post('/prototype_v3/tobacco/pipe/current/less-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/pipe/current/less-quantity')
})

router.post('/prototype_v3/tobacco/pipe/current/less-quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/pipe/current/less-duration')
})

router.post('/prototype_v3/tobacco/pipe/current/less-duration-answer', function(request, response) {
  var changes = request.session.data['pipeCurrentChanges']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  // Check if they also selected 'stopped'
  if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/pipe/current/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

router.post('/prototype_v3/tobacco/pipe/current/stopped-years-answer', function(request, response) {
  moveToNextTobaccoType(request, response)
})

// ============================================
// PIPE ROUTING - FORMER
// ============================================

router.post('/prototype_v3/tobacco/pipe/former/quantity-daily-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/pipe/former/has-quantity-changed')
})

router.post('/prototype_v3/tobacco/pipe/former/has-quantity-changed-answer', function(request, response) {
  var changes = request.session.data['pipeFormerChanges']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('more')) {
    response.redirect('/prototype_v3/tobacco/pipe/former/more-frequency')
  } else if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/pipe/former/less-frequency')
  } else if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/pipe/former/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// MORE flow - FORMER
router.post('/prototype_v3/tobacco/pipe/former/more-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/pipe/former/more-quantity')
})

router.post('/prototype_v3/tobacco/pipe/former/more-quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/pipe/former/more-duration')
})

router.post('/prototype_v3/tobacco/pipe/former/more-duration-answer', function(request, response) {
  var changes = request.session.data['pipeFormerChanges']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/pipe/former/less-frequency')
  } else if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/pipe/former/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// LESS flow - FORMER
router.post('/prototype_v3/tobacco/pipe/former/less-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/pipe/former/less-quantity')
})

router.post('/prototype_v3/tobacco/pipe/former/less-quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/pipe/former/less-duration')
})

router.post('/prototype_v3/tobacco/pipe/former/less-duration-answer', function(request, response) {
  var changes = request.session.data['pipeFormerChanges']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/pipe/former/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

router.post('/prototype_v3/tobacco/pipe/former/stopped-years-answer', function(request, response) {
  moveToNextTobaccoType(request, response)
})

// ============================================
// "DO YOU CURRENTLY SMOKE" ROUTING - CIGARS
// ============================================

router.post('/prototype_v3/tobacco/cigars/do-you-currently-smoke-answer', function(request, response) {
  var currentlySmokesCigars = request.session.data['currentlySmokesCigars']
  
  if (currentlySmokesCigars === 'Yes') {
    response.redirect('/prototype_v3/tobacco/cigars/current/quantity-daily')
  } else {
    response.redirect('/prototype_v3/tobacco/cigars/former/quantity-daily')
  }
})

// ============================================
// CIGARS ROUTING - CURRENT
// ============================================

router.post('/prototype_v3/tobacco/cigars/current/quantity-daily-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigars/current/has-quantity-changed')
})

router.post('/prototype_v3/tobacco/cigars/current/has-quantity-changed-answer', function(request, response) {
  var changes = request.session.data['cigarsCurrentChanges']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('more')) {
    response.redirect('/prototype_v3/tobacco/cigars/current/more-frequency')
  } else if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/cigars/current/less-frequency')
  } else if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/cigars/current/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// MORE flow
router.post('/prototype_v3/tobacco/cigars/current/more-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigars/current/more-quantity')
})

router.post('/prototype_v3/tobacco/cigars/current/more-quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigars/current/more-duration')
})

router.post('/prototype_v3/tobacco/cigars/current/more-duration-answer', function(request, response) {
  var changes = request.session.data['cigarsCurrentChanges']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  // Check if they also selected 'less'
  if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/cigars/current/less-frequency')
  } else if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/cigars/current/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// LESS flow
router.post('/prototype_v3/tobacco/cigars/current/less-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigars/current/less-quantity')
})

router.post('/prototype_v3/tobacco/cigars/current/less-quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigars/current/less-duration')
})

router.post('/prototype_v3/tobacco/cigars/current/less-duration-answer', function(request, response) {
  var changes = request.session.data['cigarsCurrentChanges']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  // Check if they also selected 'stopped'
  if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/cigars/current/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

router.post('/prototype_v3/tobacco/cigars/current/stopped-years-answer', function(request, response) {
  moveToNextTobaccoType(request, response)
})

// ============================================
// CIGARS ROUTING - FORMER
// ============================================

router.post('/prototype_v3/tobacco/cigars/former/quantity-daily-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigars/former/has-quantity-changed')
})

router.post('/prototype_v3/tobacco/cigars/former/has-quantity-changed-answer', function(request, response) {
  var changes = request.session.data['cigarsFormerChanges']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('more')) {
    response.redirect('/prototype_v3/tobacco/cigars/former/more-frequency')
  } else if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/cigars/former/less-frequency')
  } else if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/cigars/former/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// MORE flow - FORMER
router.post('/prototype_v3/tobacco/cigars/former/more-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigars/former/more-quantity')
})

router.post('/prototype_v3/tobacco/cigars/former/more-quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigars/former/more-duration')
})

router.post('/prototype_v3/tobacco/cigars/former/more-duration-answer', function(request, response) {
  var changes = request.session.data['cigarsFormerChanges']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/cigars/former/less-frequency')
  } else if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/cigars/former/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// LESS flow - FORMER
router.post('/prototype_v3/tobacco/cigars/former/less-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigars/former/less-quantity')
})

router.post('/prototype_v3/tobacco/cigars/former/less-quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigars/former/less-duration')
})

router.post('/prototype_v3/tobacco/cigars/former/less-duration-answer', function(request, response) {
  var changes = request.session.data['cigarsFormerChanges']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/cigars/former/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

router.post('/prototype_v3/tobacco/cigars/former/stopped-years-answer', function(request, response) {
  moveToNextTobaccoType(request, response)
})


// ============================================
// "DO YOU CURRENTLY SMOKE" ROUTING - CIGARILLOS
// ============================================

router.post('/prototype_v3/tobacco/cigarillos/do-you-currently-smoke-answer', function(request, response) {
  var currentlySmokesCigarillos = request.session.data['currentlySmokesCigarillos']
  
  if (currentlySmokesCigarillos === 'Yes') {
    response.redirect('/prototype_v3/tobacco/cigarillos/current/quantity-daily')
  } else {
    response.redirect('/prototype_v3/tobacco/cigarillos/former/quantity-daily')
  }
})

// ============================================
// CIGARILLOS ROUTING - CURRENT
// ============================================

router.post('/prototype_v3/tobacco/cigarillos/current/quantity-daily-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarillos/current/has-quantity-changed')
})

router.post('/prototype_v3/tobacco/cigarillos/current/has-quantity-changed-answer', function(request, response) {
  var changes = request.session.data['cigarillosCurrentChanges']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('more')) {
    response.redirect('/prototype_v3/tobacco/cigarillos/current/more-frequency')
  } else if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/cigarillos/current/less-frequency')
  } else if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/cigarillos/current/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// MORE flow
router.post('/prototype_v3/tobacco/cigarillos/current/more-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarillos/current/more-quantity')
})

router.post('/prototype_v3/tobacco/cigarillos/current/more-quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarillos/current/more-duration')
})

router.post('/prototype_v3/tobacco/cigarillos/current/more-duration-answer', function(request, response) {
  var changes = request.session.data['cigarillosCurrentChanges']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  // Check if they also selected 'less'
  if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/cigarillos/current/less-frequency')
  } else if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/cigarillos/current/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// LESS flow
router.post('/prototype_v3/tobacco/cigarillos/current/less-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarillos/current/less-quantity')
})

router.post('/prototype_v3/tobacco/cigarillos/current/less-quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarillos/current/less-duration')
})

router.post('/prototype_v3/tobacco/cigarillos/current/less-duration-answer', function(request, response) {
  var changes = request.session.data['cigarillosCurrentChanges']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  // Check if they also selected 'stopped'
  if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/cigarillos/current/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

router.post('/prototype_v3/tobacco/cigarillos/current/stopped-years-answer', function(request, response) {
  moveToNextTobaccoType(request, response)
})

// ============================================
// CIGARILLOS ROUTING - FORMER
// ============================================

router.post('/prototype_v3/tobacco/cigarillos/former/quantity-daily-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarillos/former/has-quantity-changed')
})

router.post('/prototype_v3/tobacco/cigarillos/former/has-quantity-changed-answer', function(request, response) {
  var changes = request.session.data['cigarillosFormerChanges']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('more')) {
    response.redirect('/prototype_v3/tobacco/cigarillos/former/more-frequency')
  } else if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/cigarillos/former/less-frequency')
  } else if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/cigarillos/former/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// MORE flow - FORMER
router.post('/prototype_v3/tobacco/cigarillos/former/more-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarillos/former/more-quantity')
})

router.post('/prototype_v3/tobacco/cigarillos/former/more-quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarillos/former/more-duration')
})

router.post('/prototype_v3/tobacco/cigarillos/former/more-duration-answer', function(request, response) {
  var changes = request.session.data['cigarillosFormerChanges']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/cigarillos/former/less-frequency')
  } else if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/cigarillos/former/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// LESS flow - FORMER
router.post('/prototype_v3/tobacco/cigarillos/former/less-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarillos/former/less-quantity')
})

router.post('/prototype_v3/tobacco/cigarillos/former/less-quantity-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarillos/former/less-duration')
})

router.post('/prototype_v3/tobacco/cigarillos/former/less-duration-answer', function(request, response) {
  var changes = request.session.data['cigarillosFormerChanges']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/cigarillos/former/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

router.post('/prototype_v3/tobacco/cigarillos/former/stopped-years-answer', function(request, response) {
  moveToNextTobaccoType(request, response)
})

// ============================================
// "DO YOU CURRENTLY SMOKE" ROUTING - SHISHA
// ============================================

router.post('/prototype_v3/tobacco/shisha/do-you-currently-smoke-answer', function(request, response) {
  var currentlySmokesShisha = request.session.data['currentlySmokesShisha']
  
  if (currentlySmokesShisha === 'Yes') {
    response.redirect('/prototype_v3/tobacco/shisha/current/years-smoked')
  } else {
    response.redirect('/prototype_v3/tobacco/shisha/former/years-smoked')
  }
})

// ============================================
// SHISHA ROUTING - CURRENT
// ============================================

router.post('/prototype_v3/tobacco/shisha/current/years-smoked-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/shisha/current/group-or-alone')
})

router.post('/prototype_v3/tobacco/shisha/current/group-or-alone-answer', function(request, response) {
  var groupOrAlone = request.session.data['shishaCurrentGroupOrAlone']
  
  if (groupOrAlone === 'Group') {
    response.redirect('/prototype_v3/tobacco/shisha/current/group-frequency')
  } else if (groupOrAlone === 'Alone') {
    response.redirect('/prototype_v3/tobacco/shisha/current/alone-frequency')
  } else if (groupOrAlone === 'Both') {
    response.redirect('/prototype_v3/tobacco/shisha/current/group-frequency')
  }
})

// GROUP flow
router.post('/prototype_v3/tobacco/shisha/current/group-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/shisha/current/group-quantity')
})

router.post('/prototype_v3/tobacco/shisha/current/group-quantity-answer', function(request, response) {
  var groupOrAlone = request.session.data['shishaCurrentGroupOrAlone']
  
  // If they smoke both group and alone, now ask about alone
  if (groupOrAlone === 'Both') {
    response.redirect('/prototype_v3/tobacco/shisha/current/alone-frequency')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// ALONE flow
router.post('/prototype_v3/tobacco/shisha/current/alone-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/shisha/current/alone-quantity')
})

router.post('/prototype_v3/tobacco/shisha/current/alone-quantity-answer', function(request, response) {
  moveToNextTobaccoType(request, response)
})

// ============================================
// SHISHA ROUTING - FORMER
// ============================================

router.post('/prototype_v3/tobacco/shisha/former/years-smoked-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/shisha/former/group-or-alone')
})

router.post('/prototype_v3/tobacco/shisha/former/group-or-alone-answer', function(request, response) {
  var groupOrAlone = request.session.data['shishaFormerGroupOrAlone']
  
  if (groupOrAlone === 'Group') {
    response.redirect('/prototype_v3/tobacco/shisha/former/group-frequency')
  } else if (groupOrAlone === 'Alone') {
    response.redirect('/prototype_v3/tobacco/shisha/former/alone-frequency')
  } else if (groupOrAlone === 'Both') {
    response.redirect('/prototype_v3/tobacco/shisha/former/group-frequency')
  }
})

// GROUP flow - FORMER
router.post('/prototype_v3/tobacco/shisha/former/group-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/shisha/former/group-quantity')
})

router.post('/prototype_v3/tobacco/shisha/former/group-quantity-answer', function(request, response) {
  var groupOrAlone = request.session.data['shishaFormerGroupOrAlone']
  
  // If they smoked both group and alone, now ask about alone
  if (groupOrAlone === 'Both') {
    response.redirect('/prototype_v3/tobacco/shisha/former/alone-frequency')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// ALONE flow - FORMER
router.post('/prototype_v3/tobacco/shisha/former/alone-frequency-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/shisha/former/alone-quantity')
})

router.post('/prototype_v3/tobacco/shisha/former/alone-quantity-answer', function(request, response) {
  moveToNextTobaccoType(request, response)
})

// ============================================
// SKIP TO HOW-OLD-WHEN-STARTED-SMOKING (FOR TESTING)
// ============================================

router.get('/prototype_v3/skip-to-tobacco', function(request, response) {
  // CLEAR ALL TOBACCO-RELATED DATA
  delete request.session.data['ageStartedSmoking']
  delete request.session.data['stoppedSmokingPeriods']
  delete request.session.data['totalYearsStoppedSmoking']
  delete request.session.data['formerSmokingQuitDate']
  delete request.session.data['tobaccoTypes']
  delete request.session.data['tobaccoQueue']
  delete request.session.data['tobaccoQueueIndex']
  
  // Clear all tobacco type data (cigarettes, rolled, pipe, cigars, cigarillos, shisha)
  // Current smoker data
  delete request.session.data['cigarettesCurrentYearsSmoked']
  delete request.session.data['cigarettesCurrentFrequency']
  delete request.session.data['cigarettesCurrentQuantityDaily']
  delete request.session.data['cigarettesCurrentQuantityWeekly']
  delete request.session.data['cigarettesCurrentQuantityMonthly']
  delete request.session.data['cigarettesCurrentChanges']
  delete request.session.data['cigarettesCurrentMoreFrequency']
  delete request.session.data['cigarettesCurrentMoreQuantityDaily']
  delete request.session.data['cigarettesCurrentMoreDurationDaily']
  delete request.session.data['cigarettesCurrentMoreQuantityWeekly']
  delete request.session.data['cigarettesCurrentMoreDurationWeekly']
  delete request.session.data['cigarettesCurrentMoreQuantityMonthly']
  delete request.session.data['cigarettesCurrentMoreDurationMonthly']
  delete request.session.data['cigarettesCurrentAnotherPeriodMore']
  delete request.session.data['cigarettesCurrentLessFrequency']
  delete request.session.data['cigarettesCurrentLessQuantityDaily']
  delete request.session.data['cigarettesCurrentLessDurationDaily']
  delete request.session.data['cigarettesCurrentLessQuantityWeekly']
  delete request.session.data['cigarettesCurrentLessDurationWeekly']
  delete request.session.data['cigarettesCurrentLessQuantityMonthly']
  delete request.session.data['cigarettesCurrentLessDurationMonthly']
  delete request.session.data['cigarettesCurrentAnotherPeriodLess']
  delete request.session.data['cigarettesCurrentStoppedYears']
  
  delete request.session.data['rolledCigarettesCurrentYearsSmoked']
  delete request.session.data['rolledCigarettesCurrentFrequency']
  delete request.session.data['rolledCigarettesCurrentQuantityDaily']
  delete request.session.data['rolledCigarettesCurrentQuantityWeekly']
  delete request.session.data['rolledCigarettesCurrentQuantityMonthly']
  delete request.session.data['rolledCigarettesCurrentChanges']
  delete request.session.data['rolledCigarettesCurrentMoreFrequency']
  delete request.session.data['rolledCigarettesCurrentMoreQuantityDaily']
  delete request.session.data['rolledCigarettesCurrentMoreDurationDaily']
  delete request.session.data['rolledCigarettesCurrentMoreQuantityWeekly']
  delete request.session.data['rolledCigarettesCurrentMoreDurationWeekly']
  delete request.session.data['rolledCigarettesCurrentMoreQuantityMonthly']
  delete request.session.data['rolledCigarettesCurrentMoreDurationMonthly']
  delete request.session.data['rolledCigarettesCurrentAnotherPeriodMore']
  delete request.session.data['rolledCigarettesCurrentLessFrequency']
  delete request.session.data['rolledCigarettesCurrentLessQuantityDaily']
  delete request.session.data['rolledCigarettesCurrentLessDurationDaily']
  delete request.session.data['rolledCigarettesCurrentLessQuantityWeekly']
  delete request.session.data['rolledCigarettesCurrentLessDurationWeekly']
  delete request.session.data['rolledCigarettesCurrentLessQuantityMonthly']
  delete request.session.data['rolledCigarettesCurrentLessDurationMonthly']
  delete request.session.data['rolledCigarettesCurrentAnotherPeriodLess']
  delete request.session.data['rolledCigarettesCurrentStoppedYears']
  
  delete request.session.data['pipeCurrentYearsSmoked']
  delete request.session.data['pipeCurrentFrequency']
  delete request.session.data['pipeCurrentQuantityDaily']
  delete request.session.data['pipeCurrentQuantityWeekly']
  delete request.session.data['pipeCurrentQuantityMonthly']
  delete request.session.data['pipeCurrentChanges']
  delete request.session.data['pipeCurrentMoreFrequency']
  delete request.session.data['pipeCurrentMoreQuantityDaily']
  delete request.session.data['pipeCurrentMoreDurationDaily']
  delete request.session.data['pipeCurrentMoreQuantityWeekly']
  delete request.session.data['pipeCurrentMoreDurationWeekly']
  delete request.session.data['pipeCurrentMoreQuantityMonthly']
  delete request.session.data['pipeCurrentMoreDurationMonthly']
  delete request.session.data['pipeCurrentAnotherPeriodMore']
  delete request.session.data['pipeCurrentLessFrequency']
  delete request.session.data['pipeCurrentLessQuantityDaily']
  delete request.session.data['pipeCurrentLessDurationDaily']
  delete request.session.data['pipeCurrentLessQuantityWeekly']
  delete request.session.data['pipeCurrentLessDurationWeekly']
  delete request.session.data['pipeCurrentLessQuantityMonthly']
  delete request.session.data['pipeCurrentLessDurationMonthly']
  delete request.session.data['pipeCurrentAnotherPeriodLess']
  delete request.session.data['pipeCurrentStoppedYears']
  
  delete request.session.data['cigarsCurrentYearsSmoked']
  delete request.session.data['cigarsCurrentFrequency']
  delete request.session.data['cigarsCurrentQuantityDaily']
  delete request.session.data['cigarsCurrentQuantityWeekly']
  delete request.session.data['cigarsCurrentQuantityMonthly']
  delete request.session.data['cigarsCurrentChanges']
  delete request.session.data['cigarsCurrentMoreFrequency']
  delete request.session.data['cigarsCurrentMoreQuantityDaily']
  delete request.session.data['cigarsCurrentMoreDurationDaily']
  delete request.session.data['cigarsCurrentMoreQuantityWeekly']
  delete request.session.data['cigarsCurrentMoreDurationWeekly']
  delete request.session.data['cigarsCurrentMoreQuantityMonthly']
  delete request.session.data['cigarsCurrentMoreDurationMonthly']
  delete request.session.data['cigarsCurrentAnotherPeriodMore']
  delete request.session.data['cigarsCurrentLessFrequency']
  delete request.session.data['cigarsCurrentLessQuantityDaily']
  delete request.session.data['cigarsCurrentLessDurationDaily']
  delete request.session.data['cigarsCurrentLessQuantityWeekly']
  delete request.session.data['cigarsCurrentLessDurationWeekly']
  delete request.session.data['cigarsCurrentLessQuantityMonthly']
  delete request.session.data['cigarsCurrentLessDurationMonthly']
  delete request.session.data['cigarsCurrentAnotherPeriodLess']
  delete request.session.data['cigarsCurrentStoppedYears']
  
  delete request.session.data['cigarillosCurrentYearsSmoked']
  delete request.session.data['cigarillosCurrentFrequency']
  delete request.session.data['cigarillosCurrentQuantityDaily']
  delete request.session.data['cigarillosCurrentQuantityWeekly']
  delete request.session.data['cigarillosCurrentQuantityMonthly']
  delete request.session.data['cigarillosCurrentChanges']
  delete request.session.data['cigarillosCurrentMoreFrequency']
  delete request.session.data['cigarillosCurrentMoreQuantityDaily']
  delete request.session.data['cigarillosCurrentMoreDurationDaily']
  delete request.session.data['cigarillosCurrentMoreQuantityWeekly']
  delete request.session.data['cigarillosCurrentMoreDurationWeekly']
  delete request.session.data['cigarillosCurrentMoreQuantityMonthly']
  delete request.session.data['cigarillosCurrentMoreDurationMonthly']
  delete request.session.data['cigarillosCurrentAnotherPeriodMore']
  delete request.session.data['cigarillosCurrentLessFrequency']
  delete request.session.data['cigarillosCurrentLessQuantityDaily']
  delete request.session.data['cigarillosCurrentLessDurationDaily']
  delete request.session.data['cigarillosCurrentLessQuantityWeekly']
  delete request.session.data['cigarillosCurrentLessDurationWeekly']
  delete request.session.data['cigarillosCurrentLessQuantityMonthly']
  delete request.session.data['cigarillosCurrentLessDurationMonthly']
  delete request.session.data['cigarillosCurrentAnotherPeriodLess']
  delete request.session.data['cigarillosCurrentStoppedYears']
  
  delete request.session.data['shishaCurrentYearsSmoked']
  delete request.session.data['shishaCurrentGroupOrAlone']
  delete request.session.data['shishaCurrentGroupFrequency']
  delete request.session.data['shishaCurrentGroupQuantityDaily']
  delete request.session.data['shishaCurrentGroupQuantityWeekly']
  delete request.session.data['shishaCurrentGroupQuantityMonthly']
  delete request.session.data['shishaCurrentGroupQuantityYearly']
  delete request.session.data['shishaCurrentAloneFrequency']
  delete request.session.data['shishaCurrentAloneQuantityDaily']
  delete request.session.data['shishaCurrentAloneQuantityWeekly']
  delete request.session.data['shishaCurrentAloneQuantityMonthly']
  delete request.session.data['shishaCurrentAloneQuantityYearly']
  
  // Former smoker data (repeat for all tobacco types)
  delete request.session.data['cigarettesFormerYearsSmoked']
  delete request.session.data['cigarettesFormerFrequency']
  delete request.session.data['cigarettesFormerQuantityDaily']
  delete request.session.data['cigarettesFormerQuantityWeekly']
  delete request.session.data['cigarettesFormerQuantityMonthly']
  delete request.session.data['cigarettesFormerChanges']
  // ... (similar deletions for Former versions of all tobacco types)
  
  // Do you currently smoke questions
  delete request.session.data['currentlySmokesCigarettes']
  delete request.session.data['currentlySmokesRolledCigarettes']
  delete request.session.data['currentlySmokesPipe']
  delete request.session.data['currentlySmokesCigars']
  delete request.session.data['currentlySmokesCigarillos']
  delete request.session.data['currentlySmokesShisha']
  
  // NOW SET THE PRE-FILLED DATA
  request.session.data['smokedRegularly'] = "Yes-currently"
  
  // Date of birth
  request.session.data['dateOfBirth'] = {
    day: "19",
    month: "06",
    year: "1965"
  }
  
  // About you section
  request.session.data['height'] = {
    feet: "5",
    inches: "10"
  }
  request.session.data['weight'] = {
    kilograms: "80"
  }
  request.session.data['whatIsYourSex'] = "Male"
  request.session.data['bestDescribe'] = "Male"
  request.session.data['ethnicBackground'] = "White"
  request.session.data['educationCompleted'] = "Bachelors degree"
  
  // Your health section
  request.session.data['EverDiagnosedWith'] = ["Pneumonia"]
  request.session.data['exposedAsbestos'] = "No"
  request.session.data['livedWithAsbestosWorker'] = "No"
  request.session.data['diagnosedCancer'] = "No"
  
  // Family history
  request.session.data['relativesHaveCancer'] = "Yes"
  request.session.data['relativeAge'] = "Yes"
  
  // Redirect to how-old-when-started-smoking with clean slate
  response.redirect("/prototype_v3/how-old-when-started-smoking")
})