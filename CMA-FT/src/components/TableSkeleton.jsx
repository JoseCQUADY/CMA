import { TableRow, TableCell, Skeleton } from '@mui/material';
import React from 'react';

const TableSkeleton = ({ rows = 5, columns = 5 }) => {
    return (
        <React.Fragment>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <TableCell key={colIndex}>
                            <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </React.Fragment>
    );
};

export default TableSkeleton;