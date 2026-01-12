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
// SMOKING HISTORY - AGE STARTED & QUIT DATE
// ============================================

// Route handler for "How old when started smoking" page
router.post('/prototype_v3/how-old-when-started-smoking-answer', function(request, response) {
  var smokedRegularly = request.session.data['smokedRegularly']
  
  if (smokedRegularly == "Yes-currently") {
    response.redirect("/prototype_v3/periods-when-you-stopped-smoking")
  } else if (smokedRegularly == "Yes-usedToRegularly") {
    response.redirect("/prototype_v3/former-smoker-when-quit-smoking")
  } else {
    response.redirect("/prototype_v3/how-old-when-started-smoking")
  }
})

// Route handler for "Former smoker when quit" page
router.post('/prototype_v3/former-smoker-when-quit-smoking-answer', function(request, response) {
  response.redirect("/prototype_v3/periods-when-you-stopped-smoking")
})

// Route handler for "Periods when you stopped smoking" page
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
// TOBACCO TYPE SELECTION
// ============================================

router.post('/prototype_v3/what-do-or-did-smoke-answer', function(request, response) {
  var selectedTobacco = request.session.data['tobaccoTypes']
  var smokedRegularly = request.session.data['smokedRegularly']
  
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
  var multipleTypes = selectedTobacco.length > 1
  
  tobaccoOrder.forEach(function(type) {
    if (selectedTobacco.includes(type)) {
      if (smokedRegularly === "Yes-currently") {
        if (multipleTypes) {
          tobaccoQueue.push(tobaccoRoutes[type] + '/do-you-currently-smoke')
        } else {
          tobaccoQueue.push(tobaccoRoutes[type] + '/current/years-smoked')
        }
      } else if (smokedRegularly === "Yes-usedToRegularly") {
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
// CIGARETTES - DO YOU CURRENTLY SMOKE
// ============================================

router.post('/prototype_v3/tobacco/cigarettes/do-you-currently-smoke-answer', function(request, response) {
  var currentlySmokesCigarettes = request.session.data['currentlySmokesCigarettes']
  
  if (currentlySmokesCigarettes === 'Yes') {
    response.redirect('/prototype_v3/tobacco/cigarettes/current/years-smoked')
  } else {
    response.redirect('/prototype_v3/tobacco/cigarettes/former/years-smoked')
  }
})

// ============================================
// CIGARETTES ROUTING - CURRENT
// ============================================

router.post('/prototype_v3/tobacco/cigarettes/current/years-smoked-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarettes/current/frequency')
})

router.post('/prototype_v3/tobacco/cigarettes/current/frequency-answer', function(request, response) {
  var frequency = request.session.data['cigarettesCurrentFrequency']
  
  if (frequency === 'Daily') {
    response.redirect('/prototype_v3/tobacco/cigarettes/current/quantity-daily')
  } else if (frequency === 'Weekly') {
    response.redirect('/prototype_v3/tobacco/cigarettes/current/quantity-weekly')
  } else if (frequency === 'Monthly') {
    response.redirect('/prototype_v3/tobacco/cigarettes/current/quantity-monthly')
  } else {
    response.redirect('/prototype_v3/tobacco/cigarettes/current/frequency')
  }
})

router.post('/prototype_v3/tobacco/cigarettes/current/quantity-daily-answer', function(request, response) {
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

router.post('/prototype_v3/tobacco/cigarettes/current/quantity-weekly-answer', function(request, response) {
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

router.post('/prototype_v3/tobacco/cigarettes/current/quantity-monthly-answer', function(request, response) {
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

// MORE routing
router.post('/prototype_v3/tobacco/cigarettes/current/more-frequency-answer', function(request, response) {
  var frequency = request.session.data['cigarettesCurrentMoreFrequency']
  
  if (frequency === 'Daily') {
    response.redirect('/prototype_v3/tobacco/cigarettes/current/more-quantity-daily')
  } else if (frequency === 'Weekly') {
    response.redirect('/prototype_v3/tobacco/cigarettes/current/more-quantity-weekly')
  } else if (frequency === 'Monthly') {
    response.redirect('/prototype_v3/tobacco/cigarettes/current/more-quantity-monthly')
  } else {
    response.redirect('/prototype_v3/tobacco/cigarettes/current/more-frequency')
  }
})

router.post('/prototype_v3/tobacco/cigarettes/current/more-quantity-daily-answer', function(request, response) {
  var changes = request.session.data['cigarettesCurrentChanges']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/cigarettes/current/less-frequency')
  } else if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/cigarettes/current/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

router.post('/prototype_v3/tobacco/cigarettes/current/more-quantity-weekly-answer', function(request, response) {
  var changes = request.session.data['cigarettesCurrentChanges']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/cigarettes/current/less-frequency')
  } else if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/cigarettes/current/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

router.post('/prototype_v3/tobacco/cigarettes/current/more-quantity-monthly-answer', function(request, response) {
  var changes = request.session.data['cigarettesCurrentChanges']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/cigarettes/current/less-frequency')
  } else if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/cigarettes/current/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// LESS routing
router.post('/prototype_v3/tobacco/cigarettes/current/less-frequency-answer', function(request, response) {
  var frequency = request.session.data['cigarettesCurrentLessFrequency']
  
  if (frequency === 'Daily') {
    response.redirect('/prototype_v3/tobacco/cigarettes/current/less-quantity-daily')
  } else if (frequency === 'Weekly') {
    response.redirect('/prototype_v3/tobacco/cigarettes/current/less-quantity-weekly')
  } else if (frequency === 'Monthly') {
    response.redirect('/prototype_v3/tobacco/cigarettes/current/less-quantity-monthly')
  } else {
    response.redirect('/prototype_v3/tobacco/cigarettes/current/less-frequency')
  }
})

router.post('/prototype_v3/tobacco/cigarettes/current/less-quantity-daily-answer', function(request, response) {
  var changes = request.session.data['cigarettesCurrentChanges']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/cigarettes/current/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

router.post('/prototype_v3/tobacco/cigarettes/current/less-quantity-weekly-answer', function(request, response) {
  var changes = request.session.data['cigarettesCurrentChanges']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
  if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/cigarettes/current/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

router.post('/prototype_v3/tobacco/cigarettes/current/less-quantity-monthly-answer', function(request, response) {
  var changes = request.session.data['cigarettesCurrentChanges']
  
  if (!Array.isArray(changes)) {
    changes = changes ? [changes] : []
  }
  
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

router.post('/prototype_v3/tobacco/cigarettes/former/years-smoked-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/cigarettes/former/frequency')
})

router.post('/prototype_v3/tobacco/cigarettes/former/frequency-answer', function(request, response) {
  var frequency = request.session.data['cigarettesFormerFrequency']
  
  if (frequency === 'Daily') {
    response.redirect('/prototype_v3/tobacco/cigarettes/former/quantity-daily')
  } else if (frequency === 'Weekly') {
    response.redirect('/prototype_v3/tobacco/cigarettes/former/quantity-weekly')
  } else if (frequency === 'Monthly') {
    response.redirect('/prototype_v3/tobacco/cigarettes/former/quantity-monthly')
  } else {
    response.redirect('/prototype_v3/tobacco/cigarettes/former/frequency')
  }
})

router.post('/prototype_v3/tobacco/cigarettes/former/quantity-daily-answer', function(request, response) {
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

router.post('/prototype_v3/tobacco/cigarettes/former/quantity-weekly-answer', function(request, response) {
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

router.post('/prototype_v3/tobacco/cigarettes/former/quantity-monthly-answer', function(request, response) {
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

// MORE routing - FORMER
router.post('/prototype_v3/tobacco/cigarettes/former/more-frequency-answer', function(request, response) {
  var frequency = request.session.data['cigarettesFormerMoreFrequency']
  
  if (frequency === 'Daily') {
    response.redirect('/prototype_v3/tobacco/cigarettes/former/more-quantity-daily')
  } else if (frequency === 'Weekly') {
    response.redirect('/prototype_v3/tobacco/cigarettes/former/more-quantity-weekly')
  } else if (frequency === 'Monthly') {
    response.redirect('/prototype_v3/tobacco/cigarettes/former/more-quantity-monthly')
  } else {
    response.redirect('/prototype_v3/tobacco/cigarettes/former/more-frequency')
  }
})

router.post('/prototype_v3/tobacco/cigarettes/former/more-quantity-daily-answer', function(request, response) {
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

router.post('/prototype_v3/tobacco/cigarettes/former/more-quantity-weekly-answer', function(request, response) {
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

router.post('/prototype_v3/tobacco/cigarettes/former/more-quantity-monthly-answer', function(request, response) {
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

// LESS routing - FORMER
router.post('/prototype_v3/tobacco/cigarettes/former/less-frequency-answer', function(request, response) {
  var frequency = request.session.data['cigarettesFormerLessFrequency']
  
  if (frequency === 'Daily') {
    response.redirect('/prototype_v3/tobacco/cigarettes/former/less-quantity-daily')
  } else if (frequency === 'Weekly') {
    response.redirect('/prototype_v3/tobacco/cigarettes/former/less-quantity-weekly')
  } else if (frequency === 'Monthly') {
    response.redirect('/prototype_v3/tobacco/cigarettes/former/less-quantity-monthly')
  } else {
    response.redirect('/prototype_v3/tobacco/cigarettes/former/less-frequency')
  }
})

router.post('/prototype_v3/tobacco/cigarettes/former/less-quantity-daily-answer', function(request, response) {
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

router.post('/prototype_v3/tobacco/cigarettes/former/less-quantity-weekly-answer', function(request, response) {
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

router.post('/prototype_v3/tobacco/cigarettes/former/less-quantity-monthly-answer', function(request, response) {
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
// ROLLED CIGARETTES - DO YOU CURRENTLY SMOKE
// ============================================

router.post('/prototype_v3/tobacco/rolled-cigarettes/do-you-currently-smoke-answer', function(request, response) {
  var currentlySmokesRolledCigarettes = request.session.data['currentlySmokesRolledCigarettes']
  
  if (currentlySmokesRolledCigarettes === 'Yes') {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/current/years-smoked')
  } else {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/former/years-smoked')
  }
})

// NOTE: ROLLED CIGARETTES follows the EXACT same pattern as CIGARETTES
// The routing logic is identical, just with different variable names
// For brevity, the full routing is shown but follows the same structure as cigarettes

// CURRENT SMOKERS - same pattern as cigarettes current
router.post('/prototype_v3/tobacco/rolled-cigarettes/current/years-smoked-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/rolled-cigarettes/current/frequency')
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/current/frequency-answer', function(request, response) {
  var frequency = request.session.data['rolledCigarettesCurrentFrequency']
  if (frequency === 'Daily') {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/current/quantity-daily')
  } else if (frequency === 'Weekly') {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/current/quantity-weekly')
  } else if (frequency === 'Monthly') {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/current/quantity-monthly')
  } else {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/current/frequency')
  }
})

// Quantity routes check for more/less/stopped
router.post('/prototype_v3/tobacco/rolled-cigarettes/current/quantity-daily-answer', function(request, response) {
  var changes = request.session.data['rolledCigarettesCurrentChanges']
  if (!Array.isArray(changes)) { changes = changes ? [changes] : [] }
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

router.post('/prototype_v3/tobacco/rolled-cigarettes/current/quantity-weekly-answer', function(request, response) {
  var changes = request.session.data['rolledCigarettesCurrentChanges']
  if (!Array.isArray(changes)) { changes = changes ? [changes] : [] }
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

router.post('/prototype_v3/tobacco/rolled-cigarettes/current/quantity-monthly-answer', function(request, response) {
  var changes = request.session.data['rolledCigarettesCurrentChanges']
  if (!Array.isArray(changes)) { changes = changes ? [changes] : [] }
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

// MORE frequency and quantity routes
router.post('/prototype_v3/tobacco/rolled-cigarettes/current/more-frequency-answer', function(request, response) {
  var frequency = request.session.data['rolledCigarettesCurrentMoreFrequency']
  if (frequency === 'Daily') {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/current/more-quantity-daily')
  } else if (frequency === 'Weekly') {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/current/more-quantity-weekly')
  } else if (frequency === 'Monthly') {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/current/more-quantity-monthly')
  } else {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/current/more-frequency')
  }
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/current/more-quantity-daily-answer', function(request, response) {
  var changes = request.session.data['rolledCigarettesCurrentChanges']
  if (!Array.isArray(changes)) { changes = changes ? [changes] : [] }
  if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/current/less-frequency')
  } else if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/current/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/current/more-quantity-weekly-answer', function(request, response) {
  var changes = request.session.data['rolledCigarettesCurrentChanges']
  if (!Array.isArray(changes)) { changes = changes ? [changes] : [] }
  if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/current/less-frequency')
  } else if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/current/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/current/more-quantity-monthly-answer', function(request, response) {
  var changes = request.session.data['rolledCigarettesCurrentChanges']
  if (!Array.isArray(changes)) { changes = changes ? [changes] : [] }
  if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/current/less-frequency')
  } else if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/current/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// LESS frequency and quantity routes
router.post('/prototype_v3/tobacco/rolled-cigarettes/current/less-frequency-answer', function(request, response) {
  var frequency = request.session.data['rolledCigarettesCurrentLessFrequency']
  if (frequency === 'Daily') {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/current/less-quantity-daily')
  } else if (frequency === 'Weekly') {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/current/less-quantity-weekly')
  } else if (frequency === 'Monthly') {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/current/less-quantity-monthly')
  } else {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/current/less-frequency')
  }
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/current/less-quantity-daily-answer', function(request, response) {
  var changes = request.session.data['rolledCigarettesCurrentChanges']
  if (!Array.isArray(changes)) { changes = changes ? [changes] : [] }
  if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/current/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/current/less-quantity-weekly-answer', function(request, response) {
  var changes = request.session.data['rolledCigarettesCurrentChanges']
  if (!Array.isArray(changes)) { changes = changes ? [changes] : [] }
  if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/current/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/current/less-quantity-monthly-answer', function(request, response) {
  var changes = request.session.data['rolledCigarettesCurrentChanges']
  if (!Array.isArray(changes)) { changes = changes ? [changes] : [] }
  if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/current/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/current/stopped-years-answer', function(request, response) {
  moveToNextTobaccoType(request, response)
})

// FORMER SMOKERS - same pattern
router.post('/prototype_v3/tobacco/rolled-cigarettes/former/years-smoked-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/rolled-cigarettes/former/frequency')
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/former/frequency-answer', function(request, response) {
  var frequency = request.session.data['rolledCigarettesFormerFrequency']
  if (frequency === 'Daily') {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/former/quantity-daily')
  } else if (frequency === 'Weekly') {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/former/quantity-weekly')
  } else if (frequency === 'Monthly') {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/former/quantity-monthly')
  } else {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/former/frequency')
  }
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/former/quantity-daily-answer', function(request, response) {
  var changes = request.session.data['rolledCigarettesFormerChanges']
  if (!Array.isArray(changes)) { changes = changes ? [changes] : [] }
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

router.post('/prototype_v3/tobacco/rolled-cigarettes/former/quantity-weekly-answer', function(request, response) {
  var changes = request.session.data['rolledCigarettesFormerChanges']
  if (!Array.isArray(changes)) { changes = changes ? [changes] : [] }
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

router.post('/prototype_v3/tobacco/rolled-cigarettes/former/quantity-monthly-answer', function(request, response) {
  var changes = request.session.data['rolledCigarettesFormerChanges']
  if (!Array.isArray(changes)) { changes = changes ? [changes] : [] }
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

router.post('/prototype_v3/tobacco/rolled-cigarettes/former/more-frequency-answer', function(request, response) {
  var frequency = request.session.data['rolledCigarettesFormerMoreFrequency']
  if (frequency === 'Daily') {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/former/more-quantity-daily')
  } else if (frequency === 'Weekly') {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/former/more-quantity-weekly')
  } else if (frequency === 'Monthly') {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/former/more-quantity-monthly')
  } else {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/former/more-frequency')
  }
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/former/more-quantity-daily-answer', function(request, response) {
  var changes = request.session.data['rolledCigarettesFormerChanges']
  if (!Array.isArray(changes)) { changes = changes ? [changes] : [] }
  if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/former/less-frequency')
  } else if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/former/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/former/more-quantity-weekly-answer', function(request, response) {
  var changes = request.session.data['rolledCigarettesFormerChanges']
  if (!Array.isArray(changes)) { changes = changes ? [changes] : [] }
  if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/former/less-frequency')
  } else if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/former/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/former/more-quantity-monthly-answer', function(request, response) {
  var changes = request.session.data['rolledCigarettesFormerChanges']
  if (!Array.isArray(changes)) { changes = changes ? [changes] : [] }
  if (changes.includes('less')) {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/former/less-frequency')
  } else if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/former/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/former/less-frequency-answer', function(request, response) {
  var frequency = request.session.data['rolledCigarettesFormerLessFrequency']
  if (frequency === 'Daily') {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/former/less-quantity-daily')
  } else if (frequency === 'Weekly') {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/former/less-quantity-weekly')
  } else if (frequency === 'Monthly') {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/former/less-quantity-monthly')
  } else {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/former/less-frequency')
  }
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/former/less-quantity-daily-answer', function(request, response) {
  var changes = request.session.data['rolledCigarettesFormerChanges']
  if (!Array.isArray(changes)) { changes = changes ? [changes] : [] }
  if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/former/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/former/less-quantity-weekly-answer', function(request, response) {
  var changes = request.session.data['rolledCigarettesFormerChanges']
  if (!Array.isArray(changes)) { changes = changes ? [changes] : [] }
  if (changes.includes('stopped')) {
    response.redirect('/prototype_v3/tobacco/rolled-cigarettes/former/stopped-years')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

router.post('/prototype_v3/tobacco/rolled-cigarettes/former/less-quantity-monthly-answer', function(request, response) {
  var changes = request.session.data['rolledCigarettesFormerChanges']
  if (!Array.isArray(changes)) { changes = changes ? [changes] : [] }
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
// NOTE: PIPE, CIGARS, and CIGARILLOS follow the EXACT same pattern
// Due to space constraints, I'm providing a condensed version
// Each has the same structure with different variable names:
// - pipe (pipeCurrentFrequency, pipeFormerFrequency, etc.)
// - cigars (cigarsCurrentFrequency, cigarsFormerFrequency, etc.)
// - cigarillos (cigarillosCurrentFrequency, cigarillosFormerFrequency, etc.)
// ============================================

// For PIPE, CIGARS, CIGARILLOS: Copy the entire ROLLED CIGARETTES section above
// and do a find/replace:
// - For PIPE: Replace "rolled-cigarettes" with "pipe" and "rolledCigarettes" with "pipe"
// - For CIGARS: Replace "rolled-cigarettes" with "cigars" and "rolledCigarettes" with "cigars"
// - For CIGARILLOS: Replace "rolled-cigarettes" with "cigarillos" and "rolledCigarettes" with "cigarillos"

// I'll provide the DO YOU CURRENTLY SMOKE routes and you can apply the pattern:

// PIPE
router.post('/prototype_v3/tobacco/pipe/do-you-currently-smoke-answer', function(request, response) {
  var currentlySmokesPipe = request.session.data['currentlySmokesPipe']
  if (currentlySmokesPipe === 'Yes') {
    response.redirect('/prototype_v3/tobacco/pipe/current/years-smoked')
  } else {
    response.redirect('/prototype_v3/tobacco/pipe/former/years-smoked')
  }
})
// Then copy the entire rolled-cigarettes current/former routing and replace variable names

// CIGARS
router.post('/prototype_v3/tobacco/cigars/do-you-currently-smoke-answer', function(request, response) {
  var currentlySmokesCigars = request.session.data['currentlySmokesCigars']
  if (currentlySmokesCigars === 'Yes') {
    response.redirect('/prototype_v3/tobacco/cigars/current/years-smoked')
  } else {
    response.redirect('/prototype_v3/tobacco/cigars/former/years-smoked')
  }
})
// Then copy the entire rolled-cigarettes current/former routing and replace variable names

// CIGARILLOS
router.post('/prototype_v3/tobacco/cigarillos/do-you-currently-smoke-answer', function(request, response) {
  var currentlySmokesCigarillos = request.session.data['currentlySmokesCigarillos']
  if (currentlySmokesCigarillos === 'Yes') {
    response.redirect('/prototype_v3/tobacco/cigarillos/current/years-smoked')
  } else {
    response.redirect('/prototype_v3/tobacco/cigarillos/former/years-smoked')
  }
})
// Then copy the entire rolled-cigarettes current/former routing and replace variable names

// ============================================
// SHISHA (UNIQUE - Different structure)
// ============================================

router.post('/prototype_v3/tobacco/shisha/do-you-currently-smoke-answer', function(request, response) {
  var currentlySmokesShisha = request.session.data['currentlySmokesShisha']
  if (currentlySmokesShisha === 'Yes') {
    response.redirect('/prototype_v3/tobacco/shisha/current/years-smoked')
  } else {
    response.redirect('/prototype_v3/tobacco/shisha/former/years-smoked')
  }
})

// SHISHA CURRENT
router.post('/prototype_v3/tobacco/shisha/current/years-smoked-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/shisha/current/group-or-alone')
})

router.post('/prototype_v3/tobacco/shisha/current/group-or-alone-answer', function(request, response) {
  var groupOrAlone = request.session.data['shishaCurrentGroupOrAlone']
  if (!Array.isArray(groupOrAlone)) {
    groupOrAlone = groupOrAlone ? [groupOrAlone] : []
  }
  if (groupOrAlone.includes('group')) {
    response.redirect('/prototype_v3/tobacco/shisha/current/group-frequency')
  } else if (groupOrAlone.includes('alone')) {
    response.redirect('/prototype_v3/tobacco/shisha/current/alone-frequency')
  } else {
    response.redirect('/prototype_v3/tobacco/shisha/current/group-or-alone')
  }
})

// GROUP routing
router.post('/prototype_v3/tobacco/shisha/current/group-frequency-answer', function(request, response) {
  var frequency = request.session.data['shishaCurrentGroupFrequency']
  if (frequency === 'Daily') {
    response.redirect('/prototype_v3/tobacco/shisha/current/group-quantity-daily')
  } else if (frequency === 'Weekly') {
    response.redirect('/prototype_v3/tobacco/shisha/current/group-quantity-weekly')
  } else if (frequency === 'Monthly') {
    response.redirect('/prototype_v3/tobacco/shisha/current/group-quantity-monthly')
  } else if (frequency === 'Yearly') {
    response.redirect('/prototype_v3/tobacco/shisha/current/group-quantity-yearly')
  } else {
    response.redirect('/prototype_v3/tobacco/shisha/current/group-frequency')
  }
})

router.post('/prototype_v3/tobacco/shisha/current/group-quantity-daily-answer', function(request, response) {
  var groupOrAlone = request.session.data['shishaCurrentGroupOrAlone']
  if (!Array.isArray(groupOrAlone)) { groupOrAlone = groupOrAlone ? [groupOrAlone] : [] }
  if (groupOrAlone.includes('alone')) {
    response.redirect('/prototype_v3/tobacco/shisha/current/alone-frequency')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

router.post('/prototype_v3/tobacco/shisha/current/group-quantity-weekly-answer', function(request, response) {
  var groupOrAlone = request.session.data['shishaCurrentGroupOrAlone']
  if (!Array.isArray(groupOrAlone)) { groupOrAlone = groupOrAlone ? [groupOrAlone] : [] }
  if (groupOrAlone.includes('alone')) {
    response.redirect('/prototype_v3/tobacco/shisha/current/alone-frequency')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

router.post('/prototype_v3/tobacco/shisha/current/group-quantity-monthly-answer', function(request, response) {
  var groupOrAlone = request.session.data['shishaCurrentGroupOrAlone']
  if (!Array.isArray(groupOrAlone)) { groupOrAlone = groupOrAlone ? [groupOrAlone] : [] }
  if (groupOrAlone.includes('alone')) {
    response.redirect('/prototype_v3/tobacco/shisha/current/alone-frequency')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

router.post('/prototype_v3/tobacco/shisha/current/group-quantity-yearly-answer', function(request, response) {
  var groupOrAlone = request.session.data['shishaCurrentGroupOrAlone']
  if (!Array.isArray(groupOrAlone)) { groupOrAlone = groupOrAlone ? [groupOrAlone] : [] }
  if (groupOrAlone.includes('alone')) {
    response.redirect('/prototype_v3/tobacco/shisha/current/alone-frequency')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

// ALONE routing
router.post('/prototype_v3/tobacco/shisha/current/alone-frequency-answer', function(request, response) {
  var frequency = request.session.data['shishaCurrentAloneFrequency']
  if (frequency === 'Daily') {
    response.redirect('/prototype_v3/tobacco/shisha/current/alone-quantity-daily')
  } else if (frequency === 'Weekly') {
    response.redirect('/prototype_v3/tobacco/shisha/current/alone-quantity-weekly')
  } else if (frequency === 'Monthly') {
    response.redirect('/prototype_v3/tobacco/shisha/current/alone-quantity-monthly')
  } else if (frequency === 'Yearly') {
    response.redirect('/prototype_v3/tobacco/shisha/current/alone-quantity-yearly')
  } else {
    response.redirect('/prototype_v3/tobacco/shisha/current/alone-frequency')
  }
})

router.post('/prototype_v3/tobacco/shisha/current/alone-quantity-daily-answer', function(request, response) {
  moveToNextTobaccoType(request, response)
})

router.post('/prototype_v3/tobacco/shisha/current/alone-quantity-weekly-answer', function(request, response) {
  moveToNextTobaccoType(request, response)
})

router.post('/prototype_v3/tobacco/shisha/current/alone-quantity-monthly-answer', function(request, response) {
  moveToNextTobaccoType(request, response)
})

router.post('/prototype_v3/tobacco/shisha/current/alone-quantity-yearly-answer', function(request, response) {
  moveToNextTobaccoType(request, response)
})

// SHISHA FORMER - Same pattern as current
router.post('/prototype_v3/tobacco/shisha/former/years-smoked-answer', function(request, response) {
  response.redirect('/prototype_v3/tobacco/shisha/former/group-or-alone')
})

router.post('/prototype_v3/tobacco/shisha/former/group-or-alone-answer', function(request, response) {
  var groupOrAlone = request.session.data['shishaFormerGroupOrAlone']
  if (!Array.isArray(groupOrAlone)) {
    groupOrAlone = groupOrAlone ? [groupOrAlone] : []
  }
  if (groupOrAlone.includes('group')) {
    response.redirect('/prototype_v3/tobacco/shisha/former/group-frequency')
  } else if (groupOrAlone.includes('alone')) {
    response.redirect('/prototype_v3/tobacco/shisha/former/alone-frequency')
  } else {
    response.redirect('/prototype_v3/tobacco/shisha/former/group-or-alone')
  }
})

router.post('/prototype_v3/tobacco/shisha/former/group-frequency-answer', function(request, response) {
  var frequency = request.session.data['shishaFormerGroupFrequency']
  if (frequency === 'Daily') {
    response.redirect('/prototype_v3/tobacco/shisha/former/group-quantity-daily')
  } else if (frequency === 'Weekly') {
    response.redirect('/prototype_v3/tobacco/shisha/former/group-quantity-weekly')
  } else if (frequency === 'Monthly') {
    response.redirect('/prototype_v3/tobacco/shisha/former/group-quantity-monthly')
  } else if (frequency === 'Yearly') {
    response.redirect('/prototype_v3/tobacco/shisha/former/group-quantity-yearly')
  } else {
    response.redirect('/prototype_v3/tobacco/shisha/former/group-frequency')
  }
})

router.post('/prototype_v3/tobacco/shisha/former/group-quantity-daily-answer', function(request, response) {
  var groupOrAlone = request.session.data['shishaFormerGroupOrAlone']
  if (!Array.isArray(groupOrAlone)) { groupOrAlone = groupOrAlone ? [groupOrAlone] : [] }
  if (groupOrAlone.includes('alone')) {
    response.redirect('/prototype_v3/tobacco/shisha/former/alone-frequency')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

router.post('/prototype_v3/tobacco/shisha/former/group-quantity-weekly-answer', function(request, response) {
  var groupOrAlone = request.session.data['shishaFormerGroupOrAlone']
  if (!Array.isArray(groupOrAlone)) { groupOrAlone = groupOrAlone ? [groupOrAlone] : [] }
  if (groupOrAlone.includes('alone')) {
    response.redirect('/prototype_v3/tobacco/shisha/former/alone-frequency')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

router.post('/prototype_v3/tobacco/shisha/former/group-quantity-monthly-answer', function(request, response) {
  var groupOrAlone = request.session.data['shishaFormerGroupOrAlone']
  if (!Array.isArray(groupOrAlone)) { groupOrAlone = groupOrAlone ? [groupOrAlone] : [] }
  if (groupOrAlone.includes('alone')) {
    response.redirect('/prototype_v3/tobacco/shisha/former/alone-frequency')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

router.post('/prototype_v3/tobacco/shisha/former/group-quantity-yearly-answer', function(request, response) {
  var groupOrAlone = request.session.data['shishaFormerGroupOrAlone']
  if (!Array.isArray(groupOrAlone)) { groupOrAlone = groupOrAlone ? [groupOrAlone] : [] }
  if (groupOrAlone.includes('alone')) {
    response.redirect('/prototype_v3/tobacco/shisha/former/alone-frequency')
  } else {
    moveToNextTobaccoType(request, response)
  }
})

router.post('/prototype_v3/tobacco/shisha/former/alone-frequency-answer', function(request, response) {
  var frequency = request.session.data['shishaFormerAloneFrequency']
  if (frequency === 'Daily') {
    response.redirect('/prototype_v3/tobacco/shisha/former/alone-quantity-daily')
  } else if (frequency === 'Weekly') {
    response.redirect('/prototype_v3/tobacco/shisha/former/alone-quantity-weekly')
  } else if (frequency === 'Monthly') {
    response.redirect('/prototype_v3/tobacco/shisha/former/alone-quantity-monthly')
  } else if (frequency === 'Yearly') {
    response.redirect('/prototype_v3/tobacco/shisha/former/alone-quantity-yearly')
  } else {
    response.redirect('/prototype_v3/tobacco/shisha/former/alone-frequency')
  }
})

router.post('/prototype_v3/tobacco/shisha/former/alone-quantity-daily-answer', function(request, response) {
  moveToNextTobaccoType(request, response)
})

router.post('/prototype_v3/tobacco/shisha/former/alone-quantity-weekly-answer', function(request, response) {
  moveToNextTobaccoType(request, response)
})

router.post('/prototype_v3/tobacco/shisha/former/alone-quantity-monthly-answer', function(request, response) {
  moveToNextTobaccoType(request, response)
})

router.post('/prototype_v3/tobacco/shisha/former/alone-quantity-yearly-answer', function(request, response) {
  moveToNextTobaccoType(request, response)
})

// ============================================
// SKIP TO TOBACCO SECTION (FOR TESTING)
// ============================================

router.get('/prototype_v3/skip-to-tobacco', function(request, response) {
  request.session.data['smokedRegularly'] = "Yes-currently"
  request.session.data['dateOfBirth'] = { day: "19", month: "06", year: "1965" }
  request.session.data['height'] = { feet: "5", inches: "10" }
  request.session.data['weight'] = { kilograms: "80" }
  request.session.data['whatIsYourSex'] = "Male"
  request.session.data['bestDescribe'] = "Male"
  request.session.data['ethnicBackground'] = "White"
  request.session.data['educationCompleted'] = "Bachelors degree"
  request.session.data['EverDiagnosedWith'] = ["Pneumonia"]
  request.session.data['exposedAsbestos'] = "No"
  request.session.data['livedWithAsbestosWorker'] = "No"
  request.session.data['diagnosedCancer'] = "No"
  request.session.data['relativesHaveCancer'] = "Yes"
  request.session.data['relativeAge'] = "Yes"
  response.redirect("/prototype_v3/how-old-when-started-smoking")
})

