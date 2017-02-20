function [ output ] = genDirectionSound( X, Fs, radius, angleAzimuth, angleElevation )
                                
    dt = 1/Fs;                  % second per sample
    Stoptime = length(X) / Fs;  % second

    t = (0:dt:Stoptime-dt)';
    N = size(t,1);              % number of sample

    Y = fft(X);
    df = Fs/N;
    f = 0:df:Fs-df;

    %set object location at
    %
    %                  obj
    %                 -  |
    %        radius -    |  depth
    %             -      |
    %           - 30 deg |
    %----------OO--------------
    %        head  width

    theta = degtorad(angleAzimuth);         % radius
    phi = degtorad(angleElevation);         % radius

%     ears = getEarDirection(radius, angleAzimuth);
%     thetaR = ears(1);
%     thetaL = ears(2);
    thetaR = degtorad(100);
    thetaL = degtorad(-100);

    HR = stereoFilter(f, radius, theta, thetaR);       % Filter for right ear
    HL = stereoFilter(f, radius, theta, thetaL);       % Filter for left ear

    % pinna features
    pinna = pinnaFeatures(theta, phi);

    YR = zeros(N,1,'double');
    YL = zeros(N,1,'double');

    for idx = 1:N
       YR(idx) = (HR(idx) * pinna) * Y(idx,2); 
       YL(idx) = (HL(idx) * pinna) * Y(idx,1); 
    end

    output = zeros(N,2,'double');
    output(:,1) = ifft(YL); % 1 = left
    output(:,2) = ifft(YR); % 2 = right

    timeC = clock;

%     for idx = 1:N % imag 0.5 sec, real 0.5 sec both 0.5 sec
%          a = real(output(idx,1)) + imag(output(idx,1));
%          b = real(output(idx,2)) + imag(output(idx,1));
%          output(idx,:) = [a,b];
%     end
    
    output = real(output);
%     plot(t,output);


%     newTime = clock - timeC;
    
%     disp('generate time = ');
%     disp(newTime(6));

end

