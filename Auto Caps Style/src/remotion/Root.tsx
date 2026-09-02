import { Composition, CalculateMetadataFunction } from 'remotion';
import { CaptionComposition } from './CaptionComposition';
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadPoppins } from "@remotion/google-fonts/Poppins";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadBebas } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadRighteous } from "@remotion/google-fonts/Righteous";
import { loadFont as loadRusso } from "@remotion/google-fonts/RussoOne";
import { loadFont as loadBungee } from "@remotion/google-fonts/Bungee";
import { loadFont as loadComfortaa } from "@remotion/google-fonts/Comfortaa";
import '../app/globals.css';

// Pre-load essential Google Fonts weights with Latin subset to prevent FOIT and minimize network requests
try {
  loadMontserrat('normal', { weights: ['400', '600', '700', '800', '900'], subsets: ['latin'], ignoreTooManyRequestsWarning: true });
  loadPoppins('normal', { weights: ['400', '600', '700', '800', '900'], subsets: ['latin'], ignoreTooManyRequestsWarning: true });
  loadInter('normal', { weights: ['400', '600', '700', '800', '900'], subsets: ['latin'], ignoreTooManyRequestsWarning: true });
  loadOswald('normal', { weights: ['400', '600', '700'], subsets: ['latin'], ignoreTooManyRequestsWarning: true });
  loadPlayfair('normal', { weights: ['400', '700', '800', '900'], subsets: ['latin'], ignoreTooManyRequestsWarning: true });
  loadBebas('normal', { subsets: ['latin'], ignoreTooManyRequestsWarning: true });
  loadAnton('normal', { subsets: ['latin'], ignoreTooManyRequestsWarning: true });
  loadRighteous('normal', { subsets: ['latin'], ignoreTooManyRequestsWarning: true });
  loadRusso('normal', { subsets: ['latin'], ignoreTooManyRequestsWarning: true });
  loadBungee('normal', { subsets: ['latin'], ignoreTooManyRequestsWarning: true });
  loadComfortaa('normal', { weights: ['400', '700'], subsets: ['latin'], ignoreTooManyRequestsWarning: true });
} catch (e) {
  console.log('Font load error', e);
}

type RootProps = { captions?: { endTime: number }[]; styleConfig?: { aspectRatio: string }; fps?: number };
const calculateMetadata: CalculateMetadataFunction<RootProps> = ({ props }) => {
  const fps = props.fps || 30;
  let duration = 300;
  if (props.captions && props.captions.length > 0) {
    const maxMs = props.captions[props.captions.length - 1].endTime;
    duration = Math.max(1, Math.round((maxMs / 1000) * fps));
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
    fps,
  };
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CaptionComposition"
        component={CaptionComposition as React.FC<unknown>}
        durationInFrames={300}
        calculateMetadata={calculateMetadata}
        fps={30} // default fallback, will be overridden by defaultProps or CLI props
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
