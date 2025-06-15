export const navigationTabs = [
  {
    name: 'Home',
    path: '/dashboard/home',
    label: 'Home',
    icon: 'el-icon-house'
  },
  {
    name: 'DPI',
    path: '/dashboard/dpi',
    label: 'DPI settings',
    icon: 'el-icon-setting'
  },
  {
    name: 'Keys',
    path: '/dashboard/keys',
    label: 'Key remapping',
    icon: 'el-icon-keyboard'
  },
  {
    name: 'Sensor',
    path: '/dashboard/sensor',
    label: 'Sensor settings',
    icon: 'el-icon-cpu'
  },
  {
    name: 'RGB',
    path: '/dashboard/rgb',
    label: 'RGB settings',
    icon: 'el-icon-magic-stick'
  }
]

export const createNavigationComposable = (router) => {
  const goBack = () => {
    router.push('/initialize')
  }

  return {
    navigationTabs,
    goBack
  }
} 