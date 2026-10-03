export const menuData = [
  {
    id: '1',
    name: 'ড্যাশবোর্ড',
    route: 'dashboard',
    icon: 'Dashboard',
    subMenu: false,
  },
  {
    id: '2',
    name: 'নিবন্ধন সংক্রান্ত',
    route: 'academic',
    icon: 'UserPlus',
    subMenu: [
      {
        id: '21',
        name: 'ব্যবহারকারীর তালিকা',
        route: 'userlist',
        icon: '',
        subMenu: false,
      },
      {
        id: '22',
        name: 'ক্লাস গ্রুপ',
        route: 'classlist',
        icon: '',
        subMenu: false,
      },
      {
        id: '23',
        name: 'শিক্ষাবর্ষ',
        route: 'sessionlist',
        icon: '',
        subMenu: false,
      }
    ],
  },
  {
    id: '4',
    name: 'সময় সেটিংস',
    route: 'timesetting',
    icon: 'Dashboard',
    subMenu: [
      {
        id: '41',
        name: 'সিফটের তালিকা',
        route: 'shiftlist',
        icon: '',
        subMenu: false,
      },
      {
        id: '42',
        name: 'সিফট সিডিউল',
        route: 'shift_schedule',
        icon: '',
        subMenu: false,
      }
    ],

  },
  {
    id: '3',
    name: 'সেটিংস',
    route: 'settings',
    icon: 'IoMdSettings',
    subMenu: false,
  },

];
