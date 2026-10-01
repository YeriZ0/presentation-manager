import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SmartphoneIcon } from 'lucide-react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import {
    useRemoteControl,
    useRemoteService,
} from '../../remote-control/hooks/useRemoteControl.js';
import { ControllerError } from './ControllerError.jsx';

export function PairingForm() {
    const [code, setCode] = useState('');
    const pending = useRemoteControl((state) => state.pending);
    const error = useRemoteControl((state) => state.error);
    const service = useRemoteService();
    const invalid = ['INVALID_CODE', 'INVALID_MESSAGE'].includes(error);

    return (
        <section
            className="flex flex-col gap-6"
            aria-labelledby="pairing-title"
        >
            <div className="flex flex-col gap-2">
                <SmartphoneIcon className="size-8" aria-hidden="true" />
                <h1 id="pairing-title" className="text-2xl font-semibold">
                    Control móvil
                </h1>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    En el escritorio, abra una presentación y pulse «Conectar
                    control móvil». Introduzca aquí el código que aparece.
                </p>
            </div>
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    if (code.length === 6) service.pair(code);
                }}
            >
                <FieldGroup>
                    <Field data-invalid={invalid} data-disabled={pending}>
                        <FieldLabel htmlFor="pairing-code">
                            Código de conexión
                        </FieldLabel>
                        <InputOTP
                            id="pairing-code"
                            maxLength={6}
                            pattern={REGEXP_ONLY_DIGITS}
                            pasteTransformer={(value) =>
                                value.replace(/[\s-]/g, '')
                            }
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            aria-invalid={invalid}
                            aria-describedby="pairing-help"
                            value={code}
                            onChange={(value) => {
                                setCode(value);
                                service.clearError();
                            }}
                            disabled={pending}
                            required
                        >
                            <InputOTPGroup>
                                {[0, 1, 2].map((index) => (
                                    <InputOTPSlot
                                        key={index}
                                        index={index}
                                        aria-invalid={invalid}
                                    />
                                ))}
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup>
                                {[3, 4, 5].map((index) => (
                                    <InputOTPSlot
                                        key={index}
                                        index={index}
                                        aria-invalid={invalid}
                                    />
                                ))}
                            </InputOTPGroup>
                        </InputOTP>
                        <FieldDescription id="pairing-help">
                            Seis dígitos. Código temporal de un solo uso.
                        </FieldDescription>
                    </Field>
                    <ControllerError />
                    <Field>
                        <Button
                            type="submit"
                            size="touch"
                            disabled={code.length !== 6 || pending}
                            aria-busy={pending}
                        >
                            {pending ? (
                                <Spinner data-icon="inline-start" />
                            ) : (
                                <SmartphoneIcon data-icon="inline-start" />
                            )}
                            {pending ? 'Conectando…' : 'Conectar'}
                        </Button>
                    </Field>
                </FieldGroup>
            </form>
            <Button variant="link" asChild>
                <Link to="/presenter">
                    Abrir el presentador en este dispositivo
                </Link>
            </Button>
        </section>
    );
}
