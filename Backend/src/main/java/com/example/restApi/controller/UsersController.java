package com.example.restApi.controller;
import com.example.restApi.entity.UserEntity;
import com.example.restApi.service.UserDetailsService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@CrossOrigin(origins = "http://localhost:3000/")
@RestController
@RequestMapping("/user")
public class UsersController {
    @Autowired
    private UserDetailsService userDetailsService;

    private UserEntity currentUser;
    private final List<UserEntity> allUsers = new ArrayList<>();

    @GetMapping("/current-user")
    public UserEntity getCurrentUserDetails() {
        return currentUser;
    }

    @PostMapping("/login-user")
    public Optional<UserEntity> loginUser(@RequestBody UserEntity userEntity, HttpSession session) {
        if (userEntity.getEmail() == null  ||  userEntity.getPassword() == null) return Optional.empty();

        var user = userDetailsService.findUser(userEntity.getEmail());
        if (user.isPresent()  && Objects.equals(user.get().getPassword(), userEntity.getPassword())) {
            user.get().setPassword(null);
            session.setAttribute("user", user);
            return user;
        }
        return Optional.empty();
    }

    @GetMapping("/session")
    public Optional<UserEntity> getSessionDetails(HttpSession session) {
        var user = session.getAttribute("user");
        if (user != null) return (Optional<UserEntity>) user;
        return Optional.empty();
    }

    @PostMapping("/current-user")
    public Boolean setCurrentUserDetails(@RequestBody UserEntity userEntity) {
        currentUser = userEntity;
        return userDetailsService.saveUser(userEntity);
    }

    @GetMapping("/all-users")
    public List<UserEntity> getAllUsers() {
        return userDetailsService.getAllUsers();
    }

    @PostMapping("/add-user")
    public ResponseEntity<Map<String, String>> addUser(@RequestBody UserEntity userEntity) {
        var user = userDetailsService.findUser(userEntity.getEmail());

        Map<String, String> body = new HashMap<>();
        ResponseEntity<Map<String, String>> responseEntity = new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
        
        if (user.isPresent()  &&  user.get().getUserId() != null) {
            body.put("error", "true");
            body.put("message", "User already exist with the email");

            responseEntity = new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
        } else {
             boolean res = userDetailsService.saveUser(userEntity);
             if (res) {
                 body.put("success", "true");
                 body.put("message", "User has been registration");

                 responseEntity = new ResponseEntity<>(body, HttpStatus.CREATED);
             }
        }

        return responseEntity;
    }

    @GetMapping("/user-details/{userId}")
    public Optional<UserEntity> getUserDetails(@PathVariable String userId) {
        return userDetailsService.getUserDetails(userId);
    }
}

