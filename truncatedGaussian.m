function [ output ] = truncatedGaussian( t )
    sigma = 0.02;
    output = 0;
    if abs(t) <= 0.5
        a = exp(-(t * t)/(2 * sigma));
        b = sqrt(2 * pi * sigma);
        output = a / b;
    end
end

