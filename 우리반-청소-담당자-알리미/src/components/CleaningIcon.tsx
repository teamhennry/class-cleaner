import { 
  Home, 
  Presentation, 
  Grid, 
  Trash2, 
  Sparkles, 
  Archive, 
  User, 
  Calendar, 
  Bell, 
  Shield, 
  Award, 
  CheckCircle2
} from 'lucide-react';

interface CleaningIconProps {
  name: string;
  className?: string;
  size?: number | string;
}

export function CleaningIcon({ name, className, size }: CleaningIconProps) {
  const iconProps = { className, size };

  switch (name) {
    case 'Home':
      return <Home {...iconProps} />;
    case 'Presentation':
      return <Presentation {...iconProps} />;
    case 'Grid':
      return <Grid {...iconProps} />;
    case 'Trash2':
      return <Trash2 {...iconProps} />;
    case 'Sparkles':
      return <Sparkles {...iconProps} />;
    case 'Archive':
      return <Archive {...iconProps} />;
    case 'User':
      return <User {...iconProps} />;
    case 'Calendar':
      return <Calendar {...iconProps} />;
    case 'Bell':
      return <Bell {...iconProps} />;
    case 'Shield':
      return <Shield {...iconProps} />;
    case 'Award':
      return <Award {...iconProps} />;
    case 'CheckCircle2':
      return <CheckCircle2 {...iconProps} />;
    default:
      return <Sparkles {...iconProps} />;
  }
}
