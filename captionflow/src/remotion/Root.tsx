import { Composition, registerRoot, CalculateMetadataFunction } from 'remotion';
import { CaptionComposition } from './CaptionComposition';

const calculateMetadata: CalculateMetadataFunction<any> = ({ props }) => {
  let duration = 300;
  if (props.captions && props.captions.length > 0) {
    const maxMs = props.captions[props.captions.length - 1].endTime;
    duration = Math.max(1, Math.round((maxMs / 1000) * 30));
  }
  let width = 1080;
  let height = 1920;

  if (props.styleConfig && props.styleConfig.aspectRatio === '16:9') {
    width = 1920;
    height = 1080;
  }

  return {
    durationInFrames: duration,
    width,
    height,
  };
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CaptionComposition"
        component={CaptionComposition as React.FC<any>}
        durationInFrames={300}
        calculateMetadata={calculateMetadata}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          videoUrl: null,
          captions: [],
          styleConfig: {
            font: 'Montserrat',
            baseColor: '#ffffff',
            accentColor: '#FFD400',
            fontSize: 100,
            baseFontSizeMultiplier: 1.0,
            accentFontSizeMultiplier: 1.3,
            position: 'center',
            animationType: 'slide-up',
            displayMode: 'line',
            aspectRatio: '9:16',
            lineLayout: 'auto',
            wrapText: true,
            clipText: false,
            textBoxWidth: 80,
            textBoxHeight: 20,
          }
        }}
      />
    </>
  );
};
