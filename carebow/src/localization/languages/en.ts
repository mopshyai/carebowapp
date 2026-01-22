/**
 * English Translations
 * Base language file with all translation keys
 */

const en = {
  // ============================================
  // COMMON
  // ============================================
  'common.ok': 'OK',
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.add': 'Add',
  'common.done': 'Done',
  'common.next': 'Next',
  'common.back': 'Back',
  'common.skip': 'Skip',
  'common.continue': 'Continue',
  'common.confirm': 'Confirm',
  'common.close': 'Close',
  'common.search': 'Search',
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.success': 'Success',
  'common.retry': 'Retry',
  'common.yes': 'Yes',
  'common.no': 'No',
  'common.or': 'or',
  'common.and': 'and',
  'common.required': 'Required',
  'common.optional': 'Optional',
  'common.comingSoon': 'Coming Soon',
  'common.seeAll': 'See All',
  'common.viewAll': 'View All',
  'common.viewMore': 'View More',
  'common.showLess': 'Show Less',
  'common.today': 'Today',
  'common.tomorrow': 'Tomorrow',
  'common.yesterday': 'Yesterday',

  // ============================================
  // AUTH
  // ============================================
  'auth.welcome': 'Welcome to CareBow',
  'auth.welcomeSubtitle': 'Compassionate care for your loved ones',
  'auth.login': 'Log In',
  'auth.signup': 'Sign Up',
  'auth.logout': 'Log Out',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.confirmPassword': 'Confirm Password',
  'auth.forgotPassword': 'Forgot Password?',
  'auth.resetPassword': 'Reset Password',
  'auth.firstName': 'First Name',
  'auth.lastName': 'Last Name',
  'auth.phone': 'Phone Number',
  'auth.createAccount': 'Create Account',
  'auth.alreadyHaveAccount': 'Already have an account?',
  'auth.dontHaveAccount': "Don't have an account?",
  'auth.verifyEmail': 'Verify Email',
  'auth.verificationCodeSent': 'We sent a verification code to {{email}}',
  'auth.resendCode': 'Resend Code',
  'auth.invalidCredentials': 'Invalid email or password',
  'auth.passwordMismatch': 'Passwords do not match',
  'auth.weakPassword': 'Password is too weak',
  'auth.emailInUse': 'Email is already in use',
  'auth.termsAgreement': 'By continuing, you agree to our Terms of Service and Privacy Policy',

  // ============================================
  // ONBOARDING
  // ============================================
  'onboarding.slide1Title': 'Smart Care Guidance',
  'onboarding.slide1Description': 'Get AI-powered recommendations for your loved ones\' health needs',
  'onboarding.slide2Title': 'Safety & Monitoring',
  'onboarding.slide2Description': 'Keep your family safe with automated check-ins and emergency alerts',
  'onboarding.slide3Title': 'Easy Booking',
  'onboarding.slide3Description': 'Book healthcare services with verified providers in just a few taps',
  'onboarding.roleSelection': 'How will you use CareBow?',
  'onboarding.roleCaregiver': 'I\'m caring for someone',
  'onboarding.roleSelf': 'I need care for myself',
  'onboarding.getStarted': 'Get Started',

  // ============================================
  // NAVIGATION
  // ============================================
  'nav.home': 'Home',
  'nav.ask': 'Ask',
  'nav.explore': 'Explore',
  'nav.messages': 'Messages',
  'nav.profile': 'Profile',
  'nav.schedule': 'Schedule',
  'nav.safety': 'Safety',
  'nav.services': 'Services',
  'nav.orders': 'Orders',
  'nav.settings': 'Settings',

  // ============================================
  // HOME SCREEN
  // ============================================
  'home.greeting': 'Hello, {{name}}',
  'home.greetingMorning': 'Good morning, {{name}}',
  'home.greetingAfternoon': 'Good afternoon, {{name}}',
  'home.greetingEvening': 'Good evening, {{name}}',
  'home.careReadiness': 'Care Readiness',
  'home.complete': 'Complete',
  'home.askCarebow': 'Ask CareBow',
  'home.askCarebowHint': 'Describe any symptoms or concerns...',
  'home.quickActions': 'Quick Actions',
  'home.recentActivity': 'Recent Activity',
  'home.upcomingAppointments': 'Upcoming Appointments',
  'home.noUpcomingAppointments': 'No upcoming appointments',
  'home.bookAppointment': 'Book Appointment',

  // ============================================
  // ASK CAREBOW / AI ASSISTANT
  // ============================================
  'ask.title': 'Ask CareBow',
  'ask.placeholder': 'Describe symptoms or ask a question...',
  'ask.voiceInput': 'Voice Input',
  'ask.attachImage': 'Attach Image',
  'ask.send': 'Send',
  'ask.thinking': 'Thinking...',
  'ask.forWho': 'Who is this for?',
  'ask.forMe': 'For me',
  'ask.forFamily': 'For family member',
  'ask.selectMember': 'Select family member',
  'ask.disclaimer': 'CareBow provides guidance only, not medical diagnosis. Consult a healthcare professional for medical advice.',
  'ask.newConversation': 'New Conversation',
  'ask.conversationHistory': 'Conversation History',

  // ============================================
  // EXPLORE SCREEN
  // ============================================
  'explore.title': 'Health Tips & Resources',
  'explore.searchTips': 'Search health tips...',
  'explore.featuredArticles': 'Featured Articles',
  'explore.quickTips': 'Quick Tips',
  'explore.categories': 'Categories',
  'explore.elderCare': 'Elder Care',
  'explore.nutrition': 'Nutrition',
  'explore.mentalHealth': 'Mental Health',
  'explore.exercise': 'Exercise',
  'explore.safety': 'Safety',
  'explore.medications': 'Medications',
  'explore.allTips': 'All Tips',
  'explore.externalResources': 'External Resources',
  'explore.readMore': 'Read More',
  'explore.minRead': '{{minutes}} min read',

  // ============================================
  // SERVICES
  // ============================================
  'services.title': 'Services',
  'services.categories': 'Categories',
  'services.popular': 'Popular Services',
  'services.search': 'Search services...',
  'services.homeCare': 'Home Care',
  'services.nursingCare': 'Nursing Care',
  'services.physiotherapy': 'Physiotherapy',
  'services.medicalEquipment': 'Medical Equipment',
  'services.labTests': 'Lab Tests',
  'services.teleconsult': 'Teleconsultation',
  'services.bookNow': 'Book Now',
  'services.priceFrom': 'From {{price}}',
  'services.perVisit': '/visit',
  'services.perMonth': '/month',

  // ============================================
  // TELEMEDICINE
  // ============================================
  'telemedicine.bookConsultation': 'Book Consultation',
  'telemedicine.selectDoctor': 'Select a Doctor',
  'telemedicine.selectDateTime': 'Select Date & Time',
  'telemedicine.confirmBooking': 'Confirm Booking',
  'telemedicine.selectDate': 'Select Date',
  'telemedicine.selectTime': 'Select Time',
  'telemedicine.consultationFee': 'Consultation Fee',
  'telemedicine.videoConsult': 'Video Consultation',
  'telemedicine.appointmentBooked': 'Appointment Booked!',
  'telemedicine.viewSchedule': 'View Schedule',
  'telemedicine.joinCall': 'Join Call',
  'telemedicine.endCall': 'End Call',
  'telemedicine.mute': 'Mute',
  'telemedicine.unmute': 'Unmute',
  'telemedicine.camera': 'Camera',
  'telemedicine.cameraOff': 'Camera Off',
  'telemedicine.connecting': 'Connecting...',

  // ============================================
  // SCHEDULE
  // ============================================
  'schedule.title': 'Schedule',
  'schedule.upcoming': 'Upcoming',
  'schedule.past': 'Past',
  'schedule.noUpcoming': 'No upcoming appointments',
  'schedule.noPast': 'No past appointments',
  'schedule.reschedule': 'Reschedule',
  'schedule.cancel': 'Cancel',
  'schedule.viewNotes': 'View Notes',
  'schedule.bookAgain': 'Book Again',

  // ============================================
  // SAFETY
  // ============================================
  'safety.title': 'Safety Hub',
  'safety.sos': 'SOS',
  'safety.sosActivated': 'SOS Activated',
  'safety.checkIn': 'Check In',
  'safety.checkInSchedule': 'Check-in Schedule',
  'safety.nextCheckIn': 'Next check-in',
  'safety.missedCheckIn': 'Missed check-in',
  'safety.emergencyContacts': 'Emergency Contacts',
  'safety.addContact': 'Add Emergency Contact',
  'safety.sosHelp': 'Press and hold to activate SOS alert',
  'safety.confirmSOS': 'Confirm SOS Alert',
  'safety.cancelSOS': 'Cancel SOS',
  'safety.alertSent': 'Alert sent to emergency contacts',
  'safety.locationShared': 'Location shared with contacts',

  // ============================================
  // PROFILE
  // ============================================
  'profile.title': 'Profile',
  'profile.personalInfo': 'Personal Information',
  'profile.familyMembers': 'Family Members',
  'profile.addresses': 'Addresses',
  'profile.healthRecords': 'Health Records',
  'profile.insurance': 'Insurance',
  'profile.notifications': 'Notifications',
  'profile.privacy': 'Privacy & Security',
  'profile.help': 'Help & Support',
  'profile.settings': 'Settings',
  'profile.careHistory': 'Care History',
  'profile.emergencyContacts': 'Emergency Contacts',

  // ============================================
  // FAMILY MEMBERS
  // ============================================
  'family.title': 'Family Members',
  'family.addMember': 'Add Family Member',
  'family.editMember': 'Edit Member',
  'family.relationship': 'Relationship',
  'family.self': 'Self',
  'family.spouse': 'Spouse',
  'family.parent': 'Parent',
  'family.child': 'Child',
  'family.sibling': 'Sibling',
  'family.grandparent': 'Grandparent',
  'family.other': 'Other',
  'family.dateOfBirth': 'Date of Birth',
  'family.gender': 'Gender',
  'family.male': 'Male',
  'family.female': 'Female',
  'family.preferNotToSay': 'Prefer not to say',
  'family.healthInfo': 'Health Information',
  'family.carePreferences': 'Care Preferences',

  // ============================================
  // HEALTH INFO
  // ============================================
  'health.allergies': 'Allergies',
  'health.noAllergies': 'No allergies recorded',
  'health.addAllergy': 'Add Allergy',
  'health.conditions': 'Health Conditions',
  'health.noConditions': 'No conditions recorded',
  'health.addCondition': 'Add Condition',
  'health.medications': 'Medications',
  'health.noMedications': 'No medications recorded',
  'health.addMedication': 'Add Medication',
  'health.bloodType': 'Blood Type',
  'health.height': 'Height',
  'health.weight': 'Weight',
  'health.mobilityStatus': 'Mobility Status',
  'health.fullyMobile': 'Fully Mobile',
  'health.needsAssistance': 'Needs Assistance',
  'health.wheelchairBound': 'Wheelchair Bound',
  'health.bedridden': 'Bedridden',

  // ============================================
  // HEALTH RECORDS
  // ============================================
  'records.title': 'Health Records',
  'records.addRecord': 'Add Record',
  'records.noRecords': 'No health records',
  'records.addFirst': 'Add your first health record',
  'records.labResult': 'Lab Result',
  'records.prescription': 'Prescription',
  'records.imaging': 'Imaging',
  'records.visitSummary': 'Visit Summary',
  'records.vaccination': 'Vaccination',
  'records.uploadDocument': 'Upload Document',
  'records.fileUpload': 'Attach Document',

  // ============================================
  // SETTINGS
  // ============================================
  'settings.title': 'Settings',
  'settings.language': 'Language',
  'settings.theme': 'Theme',
  'settings.themeLight': 'Light',
  'settings.themeDark': 'Dark',
  'settings.themeSystem': 'System',
  'settings.hapticFeedback': 'Haptic Feedback',
  'settings.notifications': 'Push Notifications',
  'settings.biometric': 'Biometric Login',
  'settings.twoFactor': 'Two-Factor Authentication',
  'settings.dataPrivacy': 'Data & Privacy',
  'settings.deleteAccount': 'Delete Account',
  'settings.version': 'Version',
  'settings.about': 'About CareBow',

  // ============================================
  // NOTIFICATIONS
  // ============================================
  'notifications.title': 'Notifications',
  'notifications.push': 'Push Notifications',
  'notifications.orderUpdates': 'Order Updates',
  'notifications.appointmentReminders': 'Appointment Reminders',
  'notifications.careAlerts': 'Care Alerts',
  'notifications.promotions': 'Promotions & Offers',
  'notifications.email': 'Email Notifications',
  'notifications.sms': 'SMS Notifications',

  // ============================================
  // ORDERS
  // ============================================
  'orders.title': 'Orders',
  'orders.active': 'Active',
  'orders.completed': 'Completed',
  'orders.cancelled': 'Cancelled',
  'orders.noOrders': 'No orders yet',
  'orders.orderDetails': 'Order Details',
  'orders.orderNumber': 'Order #{{number}}',
  'orders.orderDate': 'Order Date',
  'orders.status': 'Status',
  'orders.total': 'Total',
  'orders.trackOrder': 'Track Order',
  'orders.cancelOrder': 'Cancel Order',
  'orders.reorder': 'Reorder',
  'orders.rateService': 'Rate Service',

  // ============================================
  // CHECKOUT
  // ============================================
  'checkout.title': 'Checkout',
  'checkout.summary': 'Order Summary',
  'checkout.subtotal': 'Subtotal',
  'checkout.discount': 'Discount',
  'checkout.tax': 'Tax',
  'checkout.total': 'Total',
  'checkout.paymentMethod': 'Payment Method',
  'checkout.addCard': 'Add Card',
  'checkout.applyCoupon': 'Apply Coupon',
  'checkout.couponCode': 'Coupon Code',
  'checkout.apply': 'Apply',
  'checkout.placeOrder': 'Place Order',
  'checkout.processing': 'Processing...',

  // ============================================
  // ERRORS
  // ============================================
  'error.generic': 'Something went wrong. Please try again.',
  'error.network': 'Network error. Please check your connection.',
  'error.notFound': 'Not found',
  'error.unauthorized': 'Please log in to continue',
  'error.sessionExpired': 'Your session has expired. Please log in again.',
  'error.serverError': 'Server error. Please try again later.',
  'error.validationFailed': 'Please check your input and try again.',
  'error.fileTooLarge': 'File size exceeds the limit',
  'error.invalidFileType': 'Invalid file type',

  // ============================================
  // EMPTY STATES
  // ============================================
  'empty.noResults': 'No results found',
  'empty.noData': 'No data available',
  'empty.tryAdjusting': 'Try adjusting your search or filters',
} as const;

export type TranslationKey = keyof typeof en;
export default en;
