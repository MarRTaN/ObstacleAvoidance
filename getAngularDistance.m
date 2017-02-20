function [ outputs ] = getAngularDistance( x,y,z )
%GET Summary of this function goes here
%   Detailed explanation goes here
    outputs = zeros(1,3);
    
    minus = 90;
    if x < 0
        minus = -90;
    end
    
    outputs(1) = minus - radtodeg(atan(z/x));   % theta       
    outputs(2) = radtodeg(atan(y/z));           % phi    
    outputs(3) = sqrt((x^2) + (y^2) + (z^2));   % radius   
    
end

