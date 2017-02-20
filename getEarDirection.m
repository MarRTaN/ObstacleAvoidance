% not use la

function [ result ] = getEarDirection( r, a )

    radius = r;
    angle = a;
    theta = degtorad(angle);                                 % radius
    headRadius = 0.09;                                       % meter head radius
    
    if angle == 0                                           % case 4
        depth = radius;
        width = 0;
        thetaX = atan(depth / headRadius);
        thetaR = -((pi / 2) - thetaX);
        thetaY = atan(depth / headRadius);
        thetaL = ((pi / 2) - thetaY);
        disp('case 4');
    else
        if angle > 0
            theta = (pi / 2) - theta;
            depth = sin(theta) * radius;
            width = cos(theta) * radius;
            if width == headRadius                           % case 2
                thetaR = 0;
                thetaY = atan(depth / (width + headRadius));
                thetaL = ((pi / 2) - thetaY);
                disp('case 2');
            elseif width > headRadius                        % case 1
                thetaX = atan(depth / (width - headRadius));
                thetaR = ((pi / 2) - thetaX);
                thetaY = atan(depth / (width + headRadius));
                thetaL = ((pi / 2) - thetaY);
                disp('case 1');
            else                                             % case 3
                thetaX = atan(depth / (headRadius - width));
                thetaR = -((pi / 2) - thetaX);
                thetaY = atan(depth / (headRadius + width));
                thetaL = ((pi / 2) - thetaY);
                disp('case 3');
            end
        else % angle < 0
            theta = (pi / 2) + theta;
            depth = sin(theta) * radius;
            width = cos(theta) * radius;
            if width == headRadius                           % case 6
                thetaX = atan(depth / (width + headRadius));
                thetaR = -((pi / 2) - thetaX);
                thetaL = 0;
                disp('case 6');
            elseif width < headRadius                        % case 5
                thetaX = atan(depth / (headRadius + width));
                thetaR = -((pi / 2) - thetaX);
                thetaY = atan(depth / (headRadius - width));
                thetaL = ((pi / 2) - thetaY);
                disp('case 5');
            else                                             % case 7
                thetaX = atan(depth / (width + headRadius));
                thetaR = -((pi / 2) - thetaX);
                thetaY = atan(depth / (width - headRadius));
                thetaL = -((pi / 2) - thetaY);
                disp('case 7');
            end
        end
    end
    
    % szStr = strcat('Width :',num2str(width),' , Depth :',num2str(depth),' , tR :',num2str(radtodeg(thetaR)),' , tL :',num2str(radtodeg(thetaL)));
    % disp(szStr);
    
    result = zeros(1,2);
    result(1) = thetaR;
    result(2) = thetaL;
    

end

