package apicalendario.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void enviarCorreoBienvenida(String destinatario, String nombre) {
        SimpleMailMessage mensaje = new SimpleMailMessage();

        // El "From" idealmente debe coincidir con tu MAIL_USERNAME
        mensaje.setFrom("tu_correo@gmail.com");
        mensaje.setTo(destinatario);
        mensaje.setSubject("¡Bienvenido a tu Calendario!");
        mensaje.setText("Hola " + nombre + ",\n\n"
                + "¡Gracias por registrarte! Estamos muy emocionados de ayudarte a organizar tu día a día.\n\n"
                + "Saludos,\nEl equipo de desarrollo.");

        mailSender.send(mensaje);
    }

    public void enviarCorreoInvitacionProyecto(String destinatario, String nombreProyecto, String token) {
        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setFrom("tu_correo@gmail.com");
        mensaje.setTo(destinatario);
        mensaje.setSubject("Invitación al proyecto: " + nombreProyecto);

        // Enlace que redirigirá a tu frontend en React
        String urlAceptar = "http://localhost:5173/aceptar-invitacion/" + token;

        mensaje.setText("Hola,\n\n"
                + "Has sido invitado a colaborar en el proyecto '" + nombreProyecto + "'.\n\n"
                + "Para aceptar la invitación y unirte al tablero, haz clic en el siguiente enlace:\n"
                + urlAceptar + "\n\n"
                + "Si no esperabas esta invitación, simplemente ignora este correo.\n\n"
                + "Saludos,\nEl equipo de desarrollo.");

        mailSender.send(mensaje);
    }
}