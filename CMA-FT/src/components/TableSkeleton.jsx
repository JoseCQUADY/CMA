import { TableRow, TableCell, Skeleton, Fade } from '@mui/material';
import React from 'react';

const TableSkeleton = ({ rows = 5, columns = 5 }) => {
    return (
        <React.Fragment>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <Fade in={true} timeout={200 + (rowIndex * 100)} key={rowIndex}>
                    <TableRow>
                        {Array.from({ length: columns }).map((_, colIndex) => (
                            <TableCell key={colIndex}>
                                <Skeleton 
                                    variant="text" 
                                    sx={{ fontSize: '1rem' }}
                                    animation="wave"
                                />
                            </TableCell>
                        ))}
                    </TableRow>
                </Fade>
            ))}
        </React.Fragment>
    );
};

export default TableSkeleton;