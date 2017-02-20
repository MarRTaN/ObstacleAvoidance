[X,Fs]= audioread('Sample/Note-C.mp3');
freq = 1.9;
mul = freq;
if freq > 1
    mul = 1;
end
sound(X(1:floor(length(X)*mul)),Fs*freq);