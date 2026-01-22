/**
 * Spanish Translations
 */

import type { TranslationKey } from './en';

const es: Record<TranslationKey, string> = {
  // ============================================
  // COMMON
  // ============================================
  'common.ok': 'OK',
  'common.cancel': 'Cancelar',
  'common.save': 'Guardar',
  'common.delete': 'Eliminar',
  'common.edit': 'Editar',
  'common.add': 'Agregar',
  'common.done': 'Hecho',
  'common.next': 'Siguiente',
  'common.back': 'Atrás',
  'common.skip': 'Omitir',
  'common.continue': 'Continuar',
  'common.confirm': 'Confirmar',
  'common.close': 'Cerrar',
  'common.search': 'Buscar',
  'common.loading': 'Cargando...',
  'common.error': 'Error',
  'common.success': 'Éxito',
  'common.retry': 'Reintentar',
  'common.yes': 'Sí',
  'common.no': 'No',
  'common.or': 'o',
  'common.and': 'y',
  'common.required': 'Requerido',
  'common.optional': 'Opcional',
  'common.comingSoon': 'Próximamente',
  'common.seeAll': 'Ver Todo',
  'common.viewAll': 'Ver Todo',
  'common.viewMore': 'Ver Más',
  'common.showLess': 'Ver Menos',
  'common.today': 'Hoy',
  'common.tomorrow': 'Mañana',
  'common.yesterday': 'Ayer',

  // ============================================
  // AUTH
  // ============================================
  'auth.welcome': 'Bienvenido a CareBow',
  'auth.welcomeSubtitle': 'Cuidado compasivo para tus seres queridos',
  'auth.login': 'Iniciar Sesión',
  'auth.signup': 'Registrarse',
  'auth.logout': 'Cerrar Sesión',
  'auth.email': 'Correo Electrónico',
  'auth.password': 'Contraseña',
  'auth.confirmPassword': 'Confirmar Contraseña',
  'auth.forgotPassword': '¿Olvidaste tu Contraseña?',
  'auth.resetPassword': 'Restablecer Contraseña',
  'auth.firstName': 'Nombre',
  'auth.lastName': 'Apellido',
  'auth.phone': 'Número de Teléfono',
  'auth.createAccount': 'Crear Cuenta',
  'auth.alreadyHaveAccount': '¿Ya tienes una cuenta?',
  'auth.dontHaveAccount': '¿No tienes una cuenta?',
  'auth.verifyEmail': 'Verificar Correo',
  'auth.verificationCodeSent': 'Enviamos un código de verificación a {{email}}',
  'auth.resendCode': 'Reenviar Código',
  'auth.invalidCredentials': 'Correo o contraseña inválidos',
  'auth.passwordMismatch': 'Las contraseñas no coinciden',
  'auth.weakPassword': 'La contraseña es muy débil',
  'auth.emailInUse': 'El correo ya está en uso',
  'auth.termsAgreement': 'Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad',

  // ============================================
  // ONBOARDING
  // ============================================
  'onboarding.slide1Title': 'Guía de Cuidado Inteligente',
  'onboarding.slide1Description': 'Obtén recomendaciones con IA para las necesidades de salud de tus seres queridos',
  'onboarding.slide2Title': 'Seguridad y Monitoreo',
  'onboarding.slide2Description': 'Mantén a tu familia segura con chequeos automáticos y alertas de emergencia',
  'onboarding.slide3Title': 'Reservas Fáciles',
  'onboarding.slide3Description': 'Reserva servicios de salud con proveedores verificados en pocos pasos',
  'onboarding.roleSelection': '¿Cómo usarás CareBow?',
  'onboarding.roleCaregiver': 'Cuido de alguien',
  'onboarding.roleSelf': 'Necesito cuidado para mí',
  'onboarding.getStarted': 'Comenzar',

  // ============================================
  // NAVIGATION
  // ============================================
  'nav.home': 'Inicio',
  'nav.ask': 'Preguntar',
  'nav.explore': 'Explorar',
  'nav.messages': 'Mensajes',
  'nav.profile': 'Perfil',
  'nav.schedule': 'Agenda',
  'nav.safety': 'Seguridad',
  'nav.services': 'Servicios',
  'nav.orders': 'Pedidos',
  'nav.settings': 'Ajustes',

  // ============================================
  // HOME SCREEN
  // ============================================
  'home.greeting': 'Hola, {{name}}',
  'home.greetingMorning': 'Buenos días, {{name}}',
  'home.greetingAfternoon': 'Buenas tardes, {{name}}',
  'home.greetingEvening': 'Buenas noches, {{name}}',
  'home.careReadiness': 'Preparación del Cuidado',
  'home.complete': 'Completo',
  'home.askCarebow': 'Pregunta a CareBow',
  'home.askCarebowHint': 'Describe cualquier síntoma o preocupación...',
  'home.quickActions': 'Acciones Rápidas',
  'home.recentActivity': 'Actividad Reciente',
  'home.upcomingAppointments': 'Próximas Citas',
  'home.noUpcomingAppointments': 'Sin citas próximas',
  'home.bookAppointment': 'Agendar Cita',

  // ============================================
  // ASK CAREBOW / AI ASSISTANT
  // ============================================
  'ask.title': 'Pregunta a CareBow',
  'ask.placeholder': 'Describe síntomas o haz una pregunta...',
  'ask.voiceInput': 'Entrada de Voz',
  'ask.attachImage': 'Adjuntar Imagen',
  'ask.send': 'Enviar',
  'ask.thinking': 'Pensando...',
  'ask.forWho': '¿Para quién es?',
  'ask.forMe': 'Para mí',
  'ask.forFamily': 'Para familiar',
  'ask.selectMember': 'Seleccionar familiar',
  'ask.disclaimer': 'CareBow solo proporciona orientación, no diagnóstico médico. Consulta a un profesional de la salud para consejos médicos.',
  'ask.newConversation': 'Nueva Conversación',
  'ask.conversationHistory': 'Historial de Conversaciones',

  // ============================================
  // EXPLORE SCREEN
  // ============================================
  'explore.title': 'Consejos y Recursos de Salud',
  'explore.searchTips': 'Buscar consejos de salud...',
  'explore.featuredArticles': 'Artículos Destacados',
  'explore.quickTips': 'Consejos Rápidos',
  'explore.categories': 'Categorías',
  'explore.elderCare': 'Cuidado del Adulto Mayor',
  'explore.nutrition': 'Nutrición',
  'explore.mentalHealth': 'Salud Mental',
  'explore.exercise': 'Ejercicio',
  'explore.safety': 'Seguridad',
  'explore.medications': 'Medicamentos',
  'explore.allTips': 'Todos los Consejos',
  'explore.externalResources': 'Recursos Externos',
  'explore.readMore': 'Leer Más',
  'explore.minRead': '{{minutes}} min de lectura',

  // ============================================
  // SERVICES
  // ============================================
  'services.title': 'Servicios',
  'services.categories': 'Categorías',
  'services.popular': 'Servicios Populares',
  'services.search': 'Buscar servicios...',
  'services.homeCare': 'Cuidado en Casa',
  'services.nursingCare': 'Cuidado de Enfermería',
  'services.physiotherapy': 'Fisioterapia',
  'services.medicalEquipment': 'Equipo Médico',
  'services.labTests': 'Pruebas de Laboratorio',
  'services.teleconsult': 'Teleconsulta',
  'services.bookNow': 'Reservar Ahora',
  'services.priceFrom': 'Desde {{price}}',
  'services.perVisit': '/visita',
  'services.perMonth': '/mes',

  // ============================================
  // TELEMEDICINE
  // ============================================
  'telemedicine.bookConsultation': 'Agendar Consulta',
  'telemedicine.selectDoctor': 'Seleccionar Doctor',
  'telemedicine.selectDateTime': 'Seleccionar Fecha y Hora',
  'telemedicine.confirmBooking': 'Confirmar Reserva',
  'telemedicine.selectDate': 'Seleccionar Fecha',
  'telemedicine.selectTime': 'Seleccionar Hora',
  'telemedicine.consultationFee': 'Tarifa de Consulta',
  'telemedicine.videoConsult': 'Videoconsulta',
  'telemedicine.appointmentBooked': '¡Cita Agendada!',
  'telemedicine.viewSchedule': 'Ver Agenda',
  'telemedicine.joinCall': 'Unirse a Llamada',
  'telemedicine.endCall': 'Terminar Llamada',
  'telemedicine.mute': 'Silenciar',
  'telemedicine.unmute': 'Activar Audio',
  'telemedicine.camera': 'Cámara',
  'telemedicine.cameraOff': 'Cámara Apagada',
  'telemedicine.connecting': 'Conectando...',

  // ============================================
  // SCHEDULE
  // ============================================
  'schedule.title': 'Agenda',
  'schedule.upcoming': 'Próximas',
  'schedule.past': 'Pasadas',
  'schedule.noUpcoming': 'Sin citas próximas',
  'schedule.noPast': 'Sin citas pasadas',
  'schedule.reschedule': 'Reprogramar',
  'schedule.cancel': 'Cancelar',
  'schedule.viewNotes': 'Ver Notas',
  'schedule.bookAgain': 'Reservar de Nuevo',

  // ============================================
  // SAFETY
  // ============================================
  'safety.title': 'Centro de Seguridad',
  'safety.sos': 'SOS',
  'safety.sosActivated': 'SOS Activado',
  'safety.checkIn': 'Registro',
  'safety.checkInSchedule': 'Horario de Registro',
  'safety.nextCheckIn': 'Próximo registro',
  'safety.missedCheckIn': 'Registro perdido',
  'safety.emergencyContacts': 'Contactos de Emergencia',
  'safety.addContact': 'Agregar Contacto de Emergencia',
  'safety.sosHelp': 'Mantén presionado para activar alerta SOS',
  'safety.confirmSOS': 'Confirmar Alerta SOS',
  'safety.cancelSOS': 'Cancelar SOS',
  'safety.alertSent': 'Alerta enviada a contactos de emergencia',
  'safety.locationShared': 'Ubicación compartida con contactos',

  // ============================================
  // PROFILE
  // ============================================
  'profile.title': 'Perfil',
  'profile.personalInfo': 'Información Personal',
  'profile.familyMembers': 'Familiares',
  'profile.addresses': 'Direcciones',
  'profile.healthRecords': 'Registros de Salud',
  'profile.insurance': 'Seguro',
  'profile.notifications': 'Notificaciones',
  'profile.privacy': 'Privacidad y Seguridad',
  'profile.help': 'Ayuda y Soporte',
  'profile.settings': 'Ajustes',
  'profile.careHistory': 'Historial de Cuidado',
  'profile.emergencyContacts': 'Contactos de Emergencia',

  // ============================================
  // FAMILY MEMBERS
  // ============================================
  'family.title': 'Familiares',
  'family.addMember': 'Agregar Familiar',
  'family.editMember': 'Editar Familiar',
  'family.relationship': 'Parentesco',
  'family.self': 'Yo',
  'family.spouse': 'Cónyuge',
  'family.parent': 'Padre/Madre',
  'family.child': 'Hijo/a',
  'family.sibling': 'Hermano/a',
  'family.grandparent': 'Abuelo/a',
  'family.other': 'Otro',
  'family.dateOfBirth': 'Fecha de Nacimiento',
  'family.gender': 'Género',
  'family.male': 'Masculino',
  'family.female': 'Femenino',
  'family.preferNotToSay': 'Prefiero no decir',
  'family.healthInfo': 'Información de Salud',
  'family.carePreferences': 'Preferencias de Cuidado',

  // ============================================
  // HEALTH INFO
  // ============================================
  'health.allergies': 'Alergias',
  'health.noAllergies': 'Sin alergias registradas',
  'health.addAllergy': 'Agregar Alergia',
  'health.conditions': 'Condiciones de Salud',
  'health.noConditions': 'Sin condiciones registradas',
  'health.addCondition': 'Agregar Condición',
  'health.medications': 'Medicamentos',
  'health.noMedications': 'Sin medicamentos registrados',
  'health.addMedication': 'Agregar Medicamento',
  'health.bloodType': 'Tipo de Sangre',
  'health.height': 'Altura',
  'health.weight': 'Peso',
  'health.mobilityStatus': 'Estado de Movilidad',
  'health.fullyMobile': 'Totalmente Móvil',
  'health.needsAssistance': 'Necesita Asistencia',
  'health.wheelchairBound': 'En Silla de Ruedas',
  'health.bedridden': 'Postrado',

  // ============================================
  // HEALTH RECORDS
  // ============================================
  'records.title': 'Registros de Salud',
  'records.addRecord': 'Agregar Registro',
  'records.noRecords': 'Sin registros de salud',
  'records.addFirst': 'Agrega tu primer registro de salud',
  'records.labResult': 'Resultado de Laboratorio',
  'records.prescription': 'Receta',
  'records.imaging': 'Imagen',
  'records.visitSummary': 'Resumen de Visita',
  'records.vaccination': 'Vacunación',
  'records.uploadDocument': 'Subir Documento',
  'records.fileUpload': 'Adjuntar Documento',

  // ============================================
  // SETTINGS
  // ============================================
  'settings.title': 'Ajustes',
  'settings.language': 'Idioma',
  'settings.theme': 'Tema',
  'settings.themeLight': 'Claro',
  'settings.themeDark': 'Oscuro',
  'settings.themeSystem': 'Sistema',
  'settings.hapticFeedback': 'Retroalimentación Háptica',
  'settings.notifications': 'Notificaciones Push',
  'settings.biometric': 'Inicio de Sesión Biométrico',
  'settings.twoFactor': 'Autenticación de Dos Factores',
  'settings.dataPrivacy': 'Datos y Privacidad',
  'settings.deleteAccount': 'Eliminar Cuenta',
  'settings.version': 'Versión',
  'settings.about': 'Acerca de CareBow',

  // ============================================
  // NOTIFICATIONS
  // ============================================
  'notifications.title': 'Notificaciones',
  'notifications.push': 'Notificaciones Push',
  'notifications.orderUpdates': 'Actualizaciones de Pedidos',
  'notifications.appointmentReminders': 'Recordatorios de Citas',
  'notifications.careAlerts': 'Alertas de Cuidado',
  'notifications.promotions': 'Promociones y Ofertas',
  'notifications.email': 'Notificaciones por Correo',
  'notifications.sms': 'Notificaciones SMS',

  // ============================================
  // ORDERS
  // ============================================
  'orders.title': 'Pedidos',
  'orders.active': 'Activos',
  'orders.completed': 'Completados',
  'orders.cancelled': 'Cancelados',
  'orders.noOrders': 'Sin pedidos aún',
  'orders.orderDetails': 'Detalles del Pedido',
  'orders.orderNumber': 'Pedido #{{number}}',
  'orders.orderDate': 'Fecha del Pedido',
  'orders.status': 'Estado',
  'orders.total': 'Total',
  'orders.trackOrder': 'Rastrear Pedido',
  'orders.cancelOrder': 'Cancelar Pedido',
  'orders.reorder': 'Reordenar',
  'orders.rateService': 'Calificar Servicio',

  // ============================================
  // CHECKOUT
  // ============================================
  'checkout.title': 'Pago',
  'checkout.summary': 'Resumen del Pedido',
  'checkout.subtotal': 'Subtotal',
  'checkout.discount': 'Descuento',
  'checkout.tax': 'Impuesto',
  'checkout.total': 'Total',
  'checkout.paymentMethod': 'Método de Pago',
  'checkout.addCard': 'Agregar Tarjeta',
  'checkout.applyCoupon': 'Aplicar Cupón',
  'checkout.couponCode': 'Código de Cupón',
  'checkout.apply': 'Aplicar',
  'checkout.placeOrder': 'Realizar Pedido',
  'checkout.processing': 'Procesando...',

  // ============================================
  // ERRORS
  // ============================================
  'error.generic': 'Algo salió mal. Por favor intenta de nuevo.',
  'error.network': 'Error de red. Por favor verifica tu conexión.',
  'error.notFound': 'No encontrado',
  'error.unauthorized': 'Por favor inicia sesión para continuar',
  'error.sessionExpired': 'Tu sesión ha expirado. Por favor inicia sesión de nuevo.',
  'error.serverError': 'Error del servidor. Por favor intenta más tarde.',
  'error.validationFailed': 'Por favor verifica tu entrada e intenta de nuevo.',
  'error.fileTooLarge': 'El archivo excede el límite de tamaño',
  'error.invalidFileType': 'Tipo de archivo inválido',

  // ============================================
  // EMPTY STATES
  // ============================================
  'empty.noResults': 'Sin resultados encontrados',
  'empty.noData': 'Sin datos disponibles',
  'empty.tryAdjusting': 'Intenta ajustar tu búsqueda o filtros',
};

export default es;
