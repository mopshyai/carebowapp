import { useState } from 'react';
import { ServicesScreen } from './screens/ServicesScreen';
import { FilterBottomSheet } from './screens/FilterBottomSheet';
import { ServiceDetailScreen } from './screens/ServiceDetailScreen';

export function ServicesDemo() {
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleOpenFilter = () => {
    setIsFilterOpen(true);
  };

  const handleCloseFilter = () => {
    setIsFilterOpen(false);
  };

  const handleApplyFilters = (filters: any) => {
    console.log('Applied filters:', filters);
    // In a real app, this would filter the services list
  };

  const handleNavigateToDetail = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setCurrentView('detail');
  };

  const handleNavigateToCategoryAll = (category: string) => {
    console.log('Navigate to category:', category);
    // In a real app, this would show a full category list screen
  };

  const handleBackFromDetail = () => {
    setCurrentView('list');
  };

  const handleBook = () => {
    console.log('Booking service:', selectedServiceId);
    // In a real app, this would navigate to booking confirmation
    alert('Booking flow would continue here!');
  };

  const handleAskCareBow = () => {
    console.log('Navigate to Ask CareBow');
    // In a real app, this would navigate to Ask CareBow tab
    alert('Would navigate to Ask CareBow tab');
  };

  return (
    <>
      {currentView === 'list' && (
        <ServicesScreen
          onOpenFilter={handleOpenFilter}
          onNavigateToDetail={handleNavigateToDetail}
          onNavigateToCategoryAll={handleNavigateToCategoryAll}
        />
      )}

      {currentView === 'detail' && (
        <ServiceDetailScreen
          serviceId={selectedServiceId}
          onBack={handleBackFromDetail}
          onBook={handleBook}
          onAskCareBow={handleAskCareBow}
        />
      )}

      <FilterBottomSheet
        isOpen={isFilterOpen}
        onClose={handleCloseFilter}
        onApplyFilters={handleApplyFilters}
      />
    </>
  );
}
