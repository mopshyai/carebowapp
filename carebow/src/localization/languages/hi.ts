/**
 * Hindi Translations
 */

import type { TranslationKey } from './en';

const hi: Record<TranslationKey, string> = {
  // ============================================
  // COMMON
  // ============================================
  'common.ok': 'ठीक है',
  'common.cancel': 'रद्द करें',
  'common.save': 'सहेजें',
  'common.delete': 'हटाएं',
  'common.edit': 'संपादित करें',
  'common.add': 'जोड़ें',
  'common.done': 'हो गया',
  'common.next': 'अगला',
  'common.back': 'पीछे',
  'common.skip': 'छोड़ें',
  'common.continue': 'जारी रखें',
  'common.confirm': 'पुष्टि करें',
  'common.close': 'बंद करें',
  'common.search': 'खोजें',
  'common.loading': 'लोड हो रहा है...',
  'common.error': 'त्रुटि',
  'common.success': 'सफल',
  'common.retry': 'पुनः प्रयास करें',
  'common.yes': 'हाँ',
  'common.no': 'नहीं',
  'common.or': 'या',
  'common.and': 'और',
  'common.required': 'आवश्यक',
  'common.optional': 'वैकल्पिक',
  'common.comingSoon': 'जल्द आ रहा है',
  'common.seeAll': 'सभी देखें',
  'common.viewAll': 'सभी देखें',
  'common.viewMore': 'और देखें',
  'common.showLess': 'कम दिखाएं',
  'common.today': 'आज',
  'common.tomorrow': 'कल',
  'common.yesterday': 'कल',

  // ============================================
  // AUTH
  // ============================================
  'auth.welcome': 'CareBow में आपका स्वागत है',
  'auth.welcomeSubtitle': 'अपने प्रियजनों के लिए सहानुभूतिपूर्ण देखभाल',
  'auth.login': 'लॉग इन करें',
  'auth.signup': 'साइन अप करें',
  'auth.logout': 'लॉग आउट करें',
  'auth.email': 'ईमेल',
  'auth.password': 'पासवर्ड',
  'auth.confirmPassword': 'पासवर्ड की पुष्टि करें',
  'auth.forgotPassword': 'पासवर्ड भूल गए?',
  'auth.resetPassword': 'पासवर्ड रीसेट करें',
  'auth.firstName': 'पहला नाम',
  'auth.lastName': 'उपनाम',
  'auth.phone': 'फ़ोन नंबर',
  'auth.createAccount': 'खाता बनाएं',
  'auth.alreadyHaveAccount': 'पहले से खाता है?',
  'auth.dontHaveAccount': 'खाता नहीं है?',
  'auth.verifyEmail': 'ईमेल सत्यापित करें',
  'auth.verificationCodeSent': 'हमने {{email}} पर एक सत्यापन कोड भेजा है',
  'auth.resendCode': 'कोड पुनः भेजें',
  'auth.invalidCredentials': 'अमान्य ईमेल या पासवर्ड',
  'auth.passwordMismatch': 'पासवर्ड मेल नहीं खाते',
  'auth.weakPassword': 'पासवर्ड बहुत कमज़ोर है',
  'auth.emailInUse': 'ईमेल पहले से उपयोग में है',
  'auth.termsAgreement': 'जारी रखकर, आप हमारी सेवा की शर्तों और गोपनीयता नीति से सहमत होते हैं',

  // ============================================
  // ONBOARDING
  // ============================================
  'onboarding.slide1Title': 'स्मार्ट देखभाल मार्गदर्शन',
  'onboarding.slide1Description': 'अपने प्रियजनों की स्वास्थ्य आवश्यकताओं के लिए AI-संचालित सिफारिशें प्राप्त करें',
  'onboarding.slide2Title': 'सुरक्षा और निगरानी',
  'onboarding.slide2Description': 'स्वचालित चेक-इन और आपातकालीन अलर्ट के साथ अपने परिवार को सुरक्षित रखें',
  'onboarding.slide3Title': 'आसान बुकिंग',
  'onboarding.slide3Description': 'कुछ ही टैप में सत्यापित प्रदाताओं के साथ स्वास्थ्य सेवाएं बुक करें',
  'onboarding.roleSelection': 'आप CareBow का उपयोग कैसे करेंगे?',
  'onboarding.roleCaregiver': 'मैं किसी की देखभाल कर रहा हूं',
  'onboarding.roleSelf': 'मुझे अपने लिए देखभाल चाहिए',
  'onboarding.getStarted': 'शुरू करें',

  // ============================================
  // NAVIGATION
  // ============================================
  'nav.home': 'होम',
  'nav.ask': 'पूछें',
  'nav.explore': 'खोजें',
  'nav.messages': 'संदेश',
  'nav.profile': 'प्रोफाइल',
  'nav.schedule': 'अनुसूची',
  'nav.safety': 'सुरक्षा',
  'nav.services': 'सेवाएं',
  'nav.orders': 'ऑर्डर',
  'nav.settings': 'सेटिंग्स',

  // ============================================
  // HOME SCREEN
  // ============================================
  'home.greeting': 'नमस्ते, {{name}}',
  'home.greetingMorning': 'सुप्रभात, {{name}}',
  'home.greetingAfternoon': 'शुभ दोपहर, {{name}}',
  'home.greetingEvening': 'शुभ संध्या, {{name}}',
  'home.careReadiness': 'देखभाल की तैयारी',
  'home.complete': 'पूर्ण',
  'home.askCarebow': 'CareBow से पूछें',
  'home.askCarebowHint': 'कोई भी लक्षण या चिंता का वर्णन करें...',
  'home.quickActions': 'त्वरित कार्य',
  'home.recentActivity': 'हाल की गतिविधि',
  'home.upcomingAppointments': 'आगामी अपॉइंटमेंट',
  'home.noUpcomingAppointments': 'कोई आगामी अपॉइंटमेंट नहीं',
  'home.bookAppointment': 'अपॉइंटमेंट बुक करें',

  // ============================================
  // ASK CAREBOW / AI ASSISTANT
  // ============================================
  'ask.title': 'CareBow से पूछें',
  'ask.placeholder': 'लक्षणों का वर्णन करें या कोई प्रश्न पूछें...',
  'ask.voiceInput': 'वॉइस इनपुट',
  'ask.attachImage': 'छवि संलग्न करें',
  'ask.send': 'भेजें',
  'ask.thinking': 'सोच रहा है...',
  'ask.forWho': 'यह किसके लिए है?',
  'ask.forMe': 'मेरे लिए',
  'ask.forFamily': 'परिवार के सदस्य के लिए',
  'ask.selectMember': 'परिवार के सदस्य चुनें',
  'ask.disclaimer': 'CareBow केवल मार्गदर्शन प्रदान करता है, चिकित्सा निदान नहीं। चिकित्सा सलाह के लिए स्वास्थ्य पेशेवर से परामर्श करें।',
  'ask.newConversation': 'नई बातचीत',
  'ask.conversationHistory': 'बातचीत का इतिहास',

  // ============================================
  // EXPLORE SCREEN
  // ============================================
  'explore.title': 'स्वास्थ्य टिप्स और संसाधन',
  'explore.searchTips': 'स्वास्थ्य टिप्स खोजें...',
  'explore.featuredArticles': 'फीचर्ड आर्टिकल्स',
  'explore.quickTips': 'त्वरित टिप्स',
  'explore.categories': 'श्रेणियां',
  'explore.elderCare': 'बुजुर्ग देखभाल',
  'explore.nutrition': 'पोषण',
  'explore.mentalHealth': 'मानसिक स्वास्थ्य',
  'explore.exercise': 'व्यायाम',
  'explore.safety': 'सुरक्षा',
  'explore.medications': 'दवाइयां',
  'explore.allTips': 'सभी टिप्स',
  'explore.externalResources': 'बाहरी संसाधन',
  'explore.readMore': 'और पढ़ें',
  'explore.minRead': '{{minutes}} मिनट पढ़ें',

  // ============================================
  // SERVICES
  // ============================================
  'services.title': 'सेवाएं',
  'services.categories': 'श्रेणियां',
  'services.popular': 'लोकप्रिय सेवाएं',
  'services.search': 'सेवाएं खोजें...',
  'services.homeCare': 'होम केयर',
  'services.nursingCare': 'नर्सिंग केयर',
  'services.physiotherapy': 'फिजियोथेरेपी',
  'services.medicalEquipment': 'मेडिकल उपकरण',
  'services.labTests': 'लैब टेस्ट',
  'services.teleconsult': 'टेलीकंसल्टेशन',
  'services.bookNow': 'अभी बुक करें',
  'services.priceFrom': '{{price}} से',
  'services.perVisit': '/विजिट',
  'services.perMonth': '/महीना',

  // ============================================
  // TELEMEDICINE
  // ============================================
  'telemedicine.bookConsultation': 'परामर्श बुक करें',
  'telemedicine.selectDoctor': 'डॉक्टर चुनें',
  'telemedicine.selectDateTime': 'तारीख और समय चुनें',
  'telemedicine.confirmBooking': 'बुकिंग की पुष्टि करें',
  'telemedicine.selectDate': 'तारीख चुनें',
  'telemedicine.selectTime': 'समय चुनें',
  'telemedicine.consultationFee': 'परामर्श शुल्क',
  'telemedicine.videoConsult': 'वीडियो परामर्श',
  'telemedicine.appointmentBooked': 'अपॉइंटमेंट बुक हो गया!',
  'telemedicine.viewSchedule': 'अनुसूची देखें',
  'telemedicine.joinCall': 'कॉल में शामिल हों',
  'telemedicine.endCall': 'कॉल समाप्त करें',
  'telemedicine.mute': 'म्यूट',
  'telemedicine.unmute': 'अनम्यूट',
  'telemedicine.camera': 'कैमरा',
  'telemedicine.cameraOff': 'कैमरा बंद',
  'telemedicine.connecting': 'कनेक्ट हो रहा है...',

  // ============================================
  // SCHEDULE
  // ============================================
  'schedule.title': 'अनुसूची',
  'schedule.upcoming': 'आगामी',
  'schedule.past': 'पिछले',
  'schedule.noUpcoming': 'कोई आगामी अपॉइंटमेंट नहीं',
  'schedule.noPast': 'कोई पिछली अपॉइंटमेंट नहीं',
  'schedule.reschedule': 'पुनर्निर्धारित करें',
  'schedule.cancel': 'रद्द करें',
  'schedule.viewNotes': 'नोट्स देखें',
  'schedule.bookAgain': 'फिर से बुक करें',

  // ============================================
  // SAFETY
  // ============================================
  'safety.title': 'सुरक्षा केंद्र',
  'safety.sos': 'SOS',
  'safety.sosActivated': 'SOS सक्रिय',
  'safety.checkIn': 'चेक इन',
  'safety.checkInSchedule': 'चेक-इन अनुसूची',
  'safety.nextCheckIn': 'अगला चेक-इन',
  'safety.missedCheckIn': 'चेक-इन छूट गया',
  'safety.emergencyContacts': 'आपातकालीन संपर्क',
  'safety.addContact': 'आपातकालीन संपर्क जोड़ें',
  'safety.sosHelp': 'SOS अलर्ट सक्रिय करने के लिए दबाए रखें',
  'safety.confirmSOS': 'SOS अलर्ट की पुष्टि करें',
  'safety.cancelSOS': 'SOS रद्द करें',
  'safety.alertSent': 'आपातकालीन संपर्कों को अलर्ट भेजा गया',
  'safety.locationShared': 'संपर्कों के साथ स्थान साझा किया गया',

  // ============================================
  // PROFILE
  // ============================================
  'profile.title': 'प्रोफाइल',
  'profile.personalInfo': 'व्यक्तिगत जानकारी',
  'profile.familyMembers': 'परिवार के सदस्य',
  'profile.addresses': 'पते',
  'profile.healthRecords': 'स्वास्थ्य रिकॉर्ड',
  'profile.insurance': 'बीमा',
  'profile.notifications': 'सूचनाएं',
  'profile.privacy': 'गोपनीयता और सुरक्षा',
  'profile.help': 'सहायता और समर्थन',
  'profile.settings': 'सेटिंग्स',
  'profile.careHistory': 'देखभाल का इतिहास',
  'profile.emergencyContacts': 'आपातकालीन संपर्क',

  // ============================================
  // FAMILY MEMBERS
  // ============================================
  'family.title': 'परिवार के सदस्य',
  'family.addMember': 'सदस्य जोड़ें',
  'family.editMember': 'सदस्य संपादित करें',
  'family.relationship': 'संबंध',
  'family.self': 'स्वयं',
  'family.spouse': 'पति/पत्नी',
  'family.parent': 'माता-पिता',
  'family.child': 'बच्चा',
  'family.sibling': 'भाई-बहन',
  'family.grandparent': 'दादा-दादी',
  'family.other': 'अन्य',
  'family.dateOfBirth': 'जन्म तिथि',
  'family.gender': 'लिंग',
  'family.male': 'पुरुष',
  'family.female': 'महिला',
  'family.preferNotToSay': 'बताना नहीं चाहते',
  'family.healthInfo': 'स्वास्थ्य जानकारी',
  'family.carePreferences': 'देखभाल प्राथमिकताएं',

  // ============================================
  // HEALTH INFO
  // ============================================
  'health.allergies': 'एलर्जी',
  'health.noAllergies': 'कोई एलर्जी दर्ज नहीं',
  'health.addAllergy': 'एलर्जी जोड़ें',
  'health.conditions': 'स्वास्थ्य स्थितियां',
  'health.noConditions': 'कोई स्थिति दर्ज नहीं',
  'health.addCondition': 'स्थिति जोड़ें',
  'health.medications': 'दवाइयां',
  'health.noMedications': 'कोई दवा दर्ज नहीं',
  'health.addMedication': 'दवा जोड़ें',
  'health.bloodType': 'रक्त प्रकार',
  'health.height': 'लंबाई',
  'health.weight': 'वजन',
  'health.mobilityStatus': 'गतिशीलता स्थिति',
  'health.fullyMobile': 'पूर्ण गतिशील',
  'health.needsAssistance': 'सहायता की आवश्यकता',
  'health.wheelchairBound': 'व्हीलचेयर पर',
  'health.bedridden': 'बिस्तर पर',

  // ============================================
  // HEALTH RECORDS
  // ============================================
  'records.title': 'स्वास्थ्य रिकॉर्ड',
  'records.addRecord': 'रिकॉर्ड जोड़ें',
  'records.noRecords': 'कोई स्वास्थ्य रिकॉर्ड नहीं',
  'records.addFirst': 'अपना पहला स्वास्थ्य रिकॉर्ड जोड़ें',
  'records.labResult': 'लैब रिजल्ट',
  'records.prescription': 'प्रिस्क्रिप्शन',
  'records.imaging': 'इमेजिंग',
  'records.visitSummary': 'विजिट सारांश',
  'records.vaccination': 'टीकाकरण',
  'records.uploadDocument': 'दस्तावेज़ अपलोड करें',
  'records.fileUpload': 'दस्तावेज़ संलग्न करें',

  // ============================================
  // SETTINGS
  // ============================================
  'settings.title': 'सेटिंग्स',
  'settings.language': 'भाषा',
  'settings.theme': 'थीम',
  'settings.themeLight': 'लाइट',
  'settings.themeDark': 'डार्क',
  'settings.themeSystem': 'सिस्टम',
  'settings.hapticFeedback': 'हैप्टिक फीडबैक',
  'settings.notifications': 'पुश नोटिफिकेशन',
  'settings.biometric': 'बायोमेट्रिक लॉगिन',
  'settings.twoFactor': 'दो-कारक प्रमाणीकरण',
  'settings.dataPrivacy': 'डेटा और गोपनीयता',
  'settings.deleteAccount': 'खाता हटाएं',
  'settings.version': 'संस्करण',
  'settings.about': 'CareBow के बारे में',

  // ============================================
  // NOTIFICATIONS
  // ============================================
  'notifications.title': 'सूचनाएं',
  'notifications.push': 'पुश नोटिफिकेशन',
  'notifications.orderUpdates': 'ऑर्डर अपडेट',
  'notifications.appointmentReminders': 'अपॉइंटमेंट रिमाइंडर',
  'notifications.careAlerts': 'देखभाल अलर्ट',
  'notifications.promotions': 'प्रमोशन और ऑफर',
  'notifications.email': 'ईमेल नोटिफिकेशन',
  'notifications.sms': 'SMS नोटिफिकेशन',

  // ============================================
  // ORDERS
  // ============================================
  'orders.title': 'ऑर्डर',
  'orders.active': 'सक्रिय',
  'orders.completed': 'पूर्ण',
  'orders.cancelled': 'रद्द',
  'orders.noOrders': 'अभी तक कोई ऑर्डर नहीं',
  'orders.orderDetails': 'ऑर्डर विवरण',
  'orders.orderNumber': 'ऑर्डर #{{number}}',
  'orders.orderDate': 'ऑर्डर तिथि',
  'orders.status': 'स्थिति',
  'orders.total': 'कुल',
  'orders.trackOrder': 'ऑर्डर ट्रैक करें',
  'orders.cancelOrder': 'ऑर्डर रद्द करें',
  'orders.reorder': 'पुनः ऑर्डर करें',
  'orders.rateService': 'सेवा रेट करें',

  // ============================================
  // CHECKOUT
  // ============================================
  'checkout.title': 'चेकआउट',
  'checkout.summary': 'ऑर्डर सारांश',
  'checkout.subtotal': 'उप-कुल',
  'checkout.discount': 'छूट',
  'checkout.tax': 'कर',
  'checkout.total': 'कुल',
  'checkout.paymentMethod': 'भुगतान विधि',
  'checkout.addCard': 'कार्ड जोड़ें',
  'checkout.applyCoupon': 'कूपन लगाएं',
  'checkout.couponCode': 'कूपन कोड',
  'checkout.apply': 'लागू करें',
  'checkout.placeOrder': 'ऑर्डर करें',
  'checkout.processing': 'प्रोसेसिंग...',

  // ============================================
  // ERRORS
  // ============================================
  'error.generic': 'कुछ गलत हुआ। कृपया पुनः प्रयास करें।',
  'error.network': 'नेटवर्क त्रुटि। कृपया अपना कनेक्शन जांचें।',
  'error.notFound': 'नहीं मिला',
  'error.unauthorized': 'जारी रखने के लिए कृपया लॉग इन करें',
  'error.sessionExpired': 'आपका सत्र समाप्त हो गया है। कृपया पुनः लॉग इन करें।',
  'error.serverError': 'सर्वर त्रुटि। कृपया बाद में पुनः प्रयास करें।',
  'error.validationFailed': 'कृपया अपना इनपुट जांचें और पुनः प्रयास करें।',
  'error.fileTooLarge': 'फ़ाइल का आकार सीमा से अधिक है',
  'error.invalidFileType': 'अमान्य फ़ाइल प्रकार',

  // ============================================
  // EMPTY STATES
  // ============================================
  'empty.noResults': 'कोई परिणाम नहीं मिला',
  'empty.noData': 'कोई डेटा उपलब्ध नहीं',
  'empty.tryAdjusting': 'अपनी खोज या फ़िल्टर को समायोजित करने का प्रयास करें',
};

export default hi;
