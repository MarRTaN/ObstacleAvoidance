function [ output ] = estimateFrequency( x, Fs )

    % Choose FFT size and calculate spectrum
    Nfft = 1024;
    [Pxx,f] = pwelch(x,gausswin(Nfft),Nfft/2,Nfft,Fs);

    % Get frequency estimate (spectral peak)
    [~,loc] = max(Pxx);
    FREQ_ESTIMATE = f(loc);
    output = FREQ_ESTIMATE(1);

end

