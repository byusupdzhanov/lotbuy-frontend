import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const ContextualActionBar = ({ 
  userRole = 'buyer', 
  lotStatus = 'active',
  lotId = null,
  onAction,
  className = ""
}) => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [actions, setActions] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine if action bar should be visible based on current route
  useEffect(() => {
    const shouldShow = location.pathname.includes('/lot-details-offers') || 
                      location.pathname.includes('/browse-lots');
    setIsVisible(shouldShow);
  }, [location.pathname]);

  // Configure actions based on context
  useEffect(() => {
    if (!isVisible) return;

    let contextActions = [];

    if (location.pathname.includes('/lot-details-offers')) {
      // Lot details page actions
      if (userRole === 'seller') {
        contextActions = [
          {
            id: 'make_offer',
            label: 'Make Offer',
            icon: 'DollarSign',
            variant: 'primary',
            tooltip: 'Submit your offer for this lot'
          },
          {
            id: 'message_buyer',
            label: 'Message',
            icon: 'MessageCircle',
            variant: 'secondary',
            tooltip: 'Send message to lot owner'
          },
          {
            id: 'save_lot',
            label: 'Save',
            icon: 'Bookmark',
            variant: 'ghost',
            tooltip: 'Save lot for later'
          },
          {
            id: 'share_lot',
            label: 'Share',
            icon: 'Share2',
            variant: 'ghost',
            tooltip: 'Share this lot'
          }
        ];
      } else if (userRole === 'buyer' && lotStatus === 'active') {
        contextActions = [
          {
            id: 'view_offers',
            label: 'View Offers',
            icon: 'Eye',
            variant: 'primary',
            tooltip: 'Review submitted offers',
            badge: 3
          },
          {
            id: 'edit_lot',
            label: 'Edit',
            icon: 'Edit3',
            variant: 'secondary',
            tooltip: 'Edit lot details'
          },
          {
            id: 'close_lot',
            label: 'Close',
            icon: 'X',
            variant: 'ghost',
            tooltip: 'Close lot to new offers'
          }
        ];
      }
    } else if (location.pathname.includes('/browse-lots')) {
      // Browse lots page actions
      contextActions = [
        {
          id: 'filter',
          label: 'Filter',
          icon: 'Filter',
          variant: 'secondary',
          tooltip: 'Filter search results'
        },
        {
          id: 'sort',
          label: 'Sort',
          icon: 'ArrowUpDown',
          variant: 'secondary',
          tooltip: 'Sort lots'
        },
        {
          id: 'view_mode',
          label: 'Grid',
          icon: 'Grid3X3',
          variant: 'ghost',
          tooltip: 'Change view mode'
        }
      ];
    }

    setActions(contextActions);
  }, [isVisible, userRole, lotStatus, location.pathname]);

  const handleActionClick = (action) => {
    if (onAction) {
      onAction(action.id, { lotId, userRole, lotStatus });
    }

    // Default action handlers
    switch (action.id) {
      case 'make_offer': console.log('Opening offer modal');
        break;
      case 'message_buyer': console.log('Opening message modal');
        break;
      case 'save_lot': console.log('Saving lot');
        break;
      case 'share_lot': console.log('Opening share modal');
        break;
      case 'view_offers': console.log('Navigating to offers view');
        break;
      case 'edit_lot': console.log('Navigating to edit lot');
        break;
      case 'close_lot': console.log('Closing lot');
        break;
      case 'filter': console.log('Opening filter panel');
        break;
      case 'sort': console.log('Opening sort options');
        break;
      case 'view_mode': console.log('Toggling view mode');
        break;
      default:
        console.log('Action clicked:', action.id);
    }
  };

  if (!isVisible || actions.length === 0) {
    return null;
  }

  const primaryActions = actions.filter(a => a.variant === 'primary');
  const secondaryActions = actions.filter(a => a.variant !== 'primary');

  return (
    <>
      {/* Desktop Action Bar */}
      <div className={`hidden lg:block fixed right-6 top-1/2 transform -translate-y-1/2 z-50 ${className}`}>
        <div className="bg-surface rounded-lg shadow-lg border border-border p-2 space-y-2">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              className={`relative w-12 h-12 rounded-lg transition-all duration-200 flex items-center justify-center group ${
                action.variant === 'primary' ?'bg-primary text-white hover:bg-primary-700'
                  : action.variant === 'secondary' ?'bg-secondary-100 text-secondary-700 hover:bg-secondary-200' :'text-text-secondary hover:text-text-primary hover:bg-secondary-100'
              }`}
              title={action.tooltip}
            >
              <Icon name={action.icon} size={20} />
              {action.badge && (
                <span className="absolute -top-1 -right-1 notification-badge min-w-[18px] h-[18px] flex items-center justify-center text-xs">
                  {action.badge}
                </span>
              )}
              
              {/* Tooltip */}
              <div className="absolute right-full mr-3 px-2 py-1 bg-text-primary text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                {action.tooltip}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border">
        <div className="px-4 py-3">
          {/* Primary Actions */}
          {primaryActions.length > 0 && (
            <div className="flex space-x-3 mb-3">
              {primaryActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleActionClick(action)}
                  className="flex-1 btn-primary py-3 rounded-lg font-medium flex items-center justify-center space-x-2 relative"
                >
                  <Icon name={action.icon} size={18} />
                  <span>{action.label}</span>
                  {action.badge && (
                    <span className="absolute -top-1 -right-1 notification-badge min-w-[18px] h-[18px] flex items-center justify-center text-xs">
                      {action.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Secondary Actions */}
          {secondaryActions.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                {secondaryActions.slice(0, isExpanded ? secondaryActions.length : 3).map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleActionClick(action)}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                      action.variant === 'secondary' ?'bg-secondary-100 text-secondary-700 hover:bg-secondary-200' :'text-text-secondary hover:text-text-primary hover:bg-secondary-100'
                    }`}
                  >
                    <Icon name={action.icon} size={16} />
                    <span className="text-sm">{action.label}</span>
                  </button>
                ))}
              </div>

              {/* More Actions Toggle */}
              {secondaryActions.length > 3 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 text-text-secondary hover:text-text-primary hover:bg-secondary-100 rounded-lg transition-all duration-200"
                >
                  <Icon name={isExpanded ? "ChevronUp" : "MoreHorizontal"} size={18} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile spacing offset */}
      <div className="lg:hidden h-20" />
    </>
  );
};

export default ContextualActionBar;