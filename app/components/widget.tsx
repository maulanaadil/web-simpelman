import { useEffect, useRef, useState } from 'react';
import Button from './button';
import { cn } from '~/lib/utils';
import { toast } from 'sonner';

export default function Widget() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [showPowerMessage, setShowPowerMessage] = useState(false);

  // Show power message every 5 minutes
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPowerMessage(true);
    }, 300000); // 5 minutes

    return () => clearTimeout(timer); // Clear the timer on component unmount
  }, []);

  const handleClickOutside = (event: any) => {
    if (ref.current && !ref.current.contains(event.target)) {
      setShowPowerMessage(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);

  return (
    <div id='widget' ref={ref} className='w-full h-full'>
      <div className='fixed z-[10000] bottom-10 right-20'>
        <div
          className='z-[5000] bg-primary-500 cursor-pointer rounded-full p-3 flex justify-center items-center'
          onClick={() => setShowPowerMessage(!showPowerMessage)}
        >
          <div
            className={cn(
              'absolute z-[5500] min-w-[32.5rem] min-h-[15rem] shadow-md bg-base-50 px-8 py-12 rounded-lg bottom-[100%] right-2/3 w-full h-full flex justify-center items-center flex-col gap-4  transition-all duration-300',
              showPowerMessage
                ? 'opacity-100 visible scale-100'
                : 'opacity-0 invisible scale-90'
            )}
          >
            {showPowerMessage && (
              <>
                <p className='text-base-900 text-2xl font-semibold'>
                  Butuh Bantuan?
                </p>
                <p className='text-base-900 font-light'>
                  Hubungi kami terkait kebutuhan terkait layanan kami
                </p>
                <Button
                  variant='outline'
                  size='full'
                  text='Hubungi Kami'
                  onClick={() =>
                    window.open('https://wa.me/6288222886364', '_blank')
                  }
                />
              </>
            )}
          </div>
          <div className='animate-ping absolute inline-flex h-4/5 w-4/5 rounded-full bg-primary-400 opacity-75'></div>
          <PhoneIcon />
        </div>
      </div>
    </div>
  );
}

function PhoneIcon() {
  return (
    <svg
      width='40'
      height='40'
      viewBox='0 0 40 40'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M28.8879 18C28.1999 18 27.6559 17.44 27.6559 16.768C27.6559 16.176 27.0639 14.944 26.0719 13.872C25.0959 12.832 24.0239 12.224 23.1279 12.224C22.4399 12.224 21.8959 11.664 21.8959 10.992C21.8959 10.32 22.4559 9.75996 23.1279 9.75996C24.7279 9.75996 26.4079 10.624 27.8799 12.176C29.2559 13.632 30.1359 15.44 30.1359 16.752C30.1359 17.44 29.5759 18 28.8879 18Z'
        fill='white'
      />
      <path
        d='M34.6639 18C33.9759 18 33.4319 17.44 33.4319 16.768C33.4319 11.088 28.8079 6.48 23.1439 6.48C22.4559 6.48 21.9119 5.92 21.9119 5.248C21.9119 4.576 22.4559 4 23.1279 4C30.1679 4 35.8959 9.728 35.8959 16.768C35.8959 17.44 35.3359 18 34.6639 18Z'
        fill='white'
      />
      <path
        d='M18.3759 24.72L15.4159 27.68C14.7919 28.304 13.7999 28.304 13.1599 27.696C12.9839 27.52 12.8079 27.36 12.6319 27.184C10.9839 25.52 9.49593 23.776 8.16793 21.952C6.85594 20.128 5.79993 18.304 5.03194 16.496C4.27994 14.672 3.89594 12.928 3.89594 11.264C3.89594 10.176 4.08793 9.136 4.47193 8.176C4.85593 7.2 5.46394 6.304 6.31193 5.504C7.33593 4.496 8.45594 4 9.63994 4C10.0879 4 10.5359 4.096 10.9359 4.288C11.3519 4.48 11.7199 4.768 12.0079 5.184L15.7199 10.416C16.0079 10.816 16.2159 11.184 16.3599 11.536C16.5039 11.872 16.5839 12.208 16.5839 12.512C16.5839 12.896 16.4719 13.28 16.2479 13.648C16.0399 14.016 15.7359 14.4 15.3519 14.784L14.1359 16.048C13.9599 16.224 13.8799 16.432 13.8799 16.688C13.8799 16.816 13.8959 16.928 13.9279 17.056C13.9759 17.184 14.0239 17.28 14.0559 17.376C14.3439 17.904 14.8399 18.592 15.5439 19.424C16.2639 20.256 17.0319 21.104 17.8639 21.952C18.0239 22.112 18.1999 22.272 18.3599 22.432C18.9999 23.056 19.0159 24.08 18.3759 24.72Z'
        fill='white'
      />
      <path
        d='M35.8479 30.128C35.8479 30.576 35.7679 31.04 35.6079 31.488C35.5599 31.616 35.5119 31.744 35.4479 31.872C35.1759 32.448 34.8239 32.992 34.3599 33.504C33.5759 34.368 32.7119 34.992 31.7359 35.392C31.7199 35.392 31.7039 35.408 31.6879 35.408C30.7439 35.792 29.7199 36 28.6159 36C26.9839 36 25.2399 35.616 23.3999 34.832C21.5599 34.048 19.7199 32.992 17.8959 31.664C17.2719 31.2 16.6479 30.736 16.0559 30.24L21.2879 25.008C21.7359 25.344 22.1359 25.6 22.4719 25.776C22.5519 25.808 22.6479 25.856 22.7599 25.904C22.8879 25.952 23.0159 25.968 23.1599 25.968C23.4319 25.968 23.6399 25.872 23.8159 25.696L25.0319 24.496C25.4319 24.096 25.8159 23.792 26.1839 23.6C26.5519 23.376 26.9199 23.264 27.3199 23.264C27.6239 23.264 27.9439 23.328 28.2959 23.472C28.6479 23.616 29.0159 23.824 29.4159 24.096L34.7119 27.856C35.1279 28.144 35.4159 28.48 35.5919 28.88C35.7519 29.28 35.8479 29.68 35.8479 30.128Z'
        fill='white'
      />
    </svg>
  );
}
