export interface CustomDesign {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  centerImage?: string;
}

export const defaultDesign: CustomDesign = {
  backgroundColor: 'transparent',
  borderColor: '#ffffff',
  textColor: '#ffffff'
};

export const createWheelData = (
  segments: Array<{ id: string; text: string; color: string; weight?: number }>,
  customDesign: CustomDesign,
  isPro: boolean = false
) => {
  return segments.map(segment => ({
    option: segment.text,
    style: {
      backgroundColor: segment.color,
      textColor: isPro ? customDesign.textColor : 'white'
    }
  }));
};

export const getWheelProps = (customDesign: CustomDesign, isPro: boolean = false, size: 'small' | 'medium' | 'large' = 'medium') => {
  const sizeConfig = {
    small: {
      outerBorderWidth: 4,
      innerBorderWidth: 2,
      radiusLineWidth: 1,
      fontSize: 10,
      textDistance: 35,
      spinDuration: 0.5
    },
    medium: {
      outerBorderWidth: 6,
      innerBorderWidth: 3,
      radiusLineWidth: 1,
      fontSize: 12,
      textDistance: 45,
      spinDuration: 0.5
    },
    large: {
      outerBorderWidth: 8,
      innerBorderWidth: 4,
      radiusLineWidth: 2,
      fontSize: 16,
      textDistance: 60,
      spinDuration: 0.8
    }
  };

  const config = sizeConfig[size];
  const borderColor = isPro ? customDesign.borderColor : '#ffffff';

  return {
    outerBorderColor: borderColor,
    outerBorderWidth: config.outerBorderWidth,
    innerBorderColor: borderColor,
    innerBorderWidth: config.innerBorderWidth,
    radiusLineColor: borderColor,
    radiusLineWidth: config.radiusLineWidth,
    fontSize: config.fontSize,
    textDistance: config.textDistance,
    spinDuration: config.spinDuration
  };
};

export const getContainerStyle = (customDesign: CustomDesign, isPro: boolean = false) => {
  return {
    backgroundColor: isPro ? customDesign.backgroundColor : 'transparent'
  };
}; 