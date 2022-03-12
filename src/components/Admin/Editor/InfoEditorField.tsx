import { Info } from '@prisma/client';
import { useContext } from 'react';
import { Button } from 'react-bootstrap';
import { ErrorLogger } from '../../../contexts';
import useExtendedState from '../../../hooks/useExtendedState';
import api from '../../../utils/api';
import BottomTextInput from '../../BottomTextInput';
import { BsTrash } from 'react-icons/bs';

type InfoEditorFieldProps = {
    info: Info;
    onDelete(id: number): void;
}

export default function InfoEditorField(props: InfoEditorFieldProps) {
    const [lastName, name, setName] = useExtendedState(props.info.name);
    const logError = useContext(ErrorLogger);

    function onBlur() {
        if (name === lastName) return;
        setName(name);
        api.post('/sheet/info', { id: props.info.id, name }).catch(logError);
    }

    return (
        <tr>
            <td style={{ width: 50 }}>
                <Button onClick={() => props.onDelete(props.info.id)} size='sm' variant='dark'>
                    <BsTrash color='white' size={24} />
                </Button>
            </td>
            <td>
                <BottomTextInput value={name} onChange={ev => setName(ev.currentTarget.value)}
                    onBlur={onBlur} className='w-100' />
            </td>
        </tr>
    );
}