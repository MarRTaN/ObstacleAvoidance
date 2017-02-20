function [ residualSignal ] = gaborAtom( X, Fs, lambda )

    dt = 1/Fs;                  % second per sample
    Stoptime = length(X) / Fs;  % second
    t = (0:dt:Stoptime-dt)';
    N = size(t,1);              % number of sample
    f = estimateFrequency(X,Fs);
    disp(f);
    
    s = N;                                       % scale
    u = ((N-(s/2)-1/2)+((s/2)-1/2)) * 1 / 4;     % translation (shift graph)
    
%     if mod(s,2) == 0
%         u = (s/2) - (1/2);
%     else
%         u = (s/2);
%     end

    k = -N/2;
    omega = 2 * pi * k / N;
    omega = omega * lambda;
    
    phi = 3 * pi /2;
    
    Ys = 0.0006 / truncatedGaussian(0.5);
    
    gaborSignal = zeros(N,2);
    
    for idx = 1:N;
        truncated = truncatedGaussian((idx - u) / s);
        filter = Ys * truncated * cos((omega * idx * (1/f)) + phi);
        gaborSignal(idx,1) = filter * X(idx,1);
        gaborSignal(idx,2) = filter * X(idx,2);
    end
    
    pksLeft = findpeaks(gaborSignal(:,1));
    pksRight = findpeaks(gaborSignal(:,2));
    
    atomNumber = 50;
    
    [atomLeft,atomLeftIndices] = sort(abs(pksLeft),'descend');
    [atomRight,atomRightIndices] = sort(abs(pksRight),'descend');
    
    atomSubtractLeft = atomLeftIndices(1:atomNumber);
    atomSubtractRight = atomRightIndices(1:atomNumber);
    
    residualSignal = X;
    
    for idx = 1:atomNumber
        
        left = atomSubtractLeft(idx);
        right = atomSubtractRight(idx);
        
        gaborSignal(left,1) = 0;
        gaborSignal(right,2) = 0;
        
        residualSignal = residualSignal - gaborSignal;
        
%         residualSignal(left,1) = residualSignal(left,1) - gaborSignal(left,1);
%         residualSignal(right,2) = residualSignal(right,2) - gaborSignal(right,2);
        
    end

end

